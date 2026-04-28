/**
 * Service de prédiction ML pour l'analytics
 * Utilise des modèles simples de régression pour prédire le remplissage
 */
class PredictionService {
  constructor() {
    this.modelVersion = 'v1';
    this.threshold = 0.7;
  }

  /**
   * Prédire le niveau de remplissage pour un conteneur demain
   * Utilise une régression linéaire simple basée sur l'historique
   */
  async predictContainerFill(containerId, targetDate = new Date()) {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    try {
      // Récupérer l'historique des 7 derniers jours
      const startDate = new Date(targetDate);
      startDate.setDate(startDate.getDate() - 7);
      
      const metrics = await prisma.containerMetrics.findMany({
        where: {
          container_id: containerId,
          date: {
            gte: startDate,
            lte: targetDate,
          },
        },
        orderBy: { date: 'asc' },
      });

      if (metrics.length < 3) {
        // Pas assez de données, retourner une prédiction par défaut
        return {
          container_id: containerId,
          predicted_date: targetDate,
          predicted_fill: 50,
          confidence: 0.3,
          model_version: this.modelVersion,
        };
      }

      // Extraire les niveaux de remplissage
      const fillLevels = metrics.map(m => m.avg_fill_level);
      
      // Calculer la tendance (simple régression linéaire)
      const n = fillLevels.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      
      for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += fillLevels[i];
        sumXY += i * fillLevels[i];
        sumX2 += i * i;
      }
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      // Prédire pour demain (n + 1)
      const predictedFill = Math.min(100, Math.max(0, slope * n + intercept));
      
      // Calculer le coefficient de confiance basé sur la variance
      const mean = sumY / n;
      const variance = fillLevels.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
      const stdDev = Math.sqrt(variance);
      const confidence = Math.max(0.3, 1 - (stdDev / 50));

      // Enregistrer la prédiction
      const prediction = await prisma.fillPrediction.upsert({
        where: {
          container_id_predicted_date: {
            container_id: containerId,
            predicted_date: targetDate,
          },
        },
        create: {
          container_id: containerId,
          predicted_date: targetDate,
          predicted_fill: Math.round(predictedFill),
          weather_factor: 0,
          confidence: confidence,
          model_version: this.modelVersion,
        },
        update: {
          predicted_fill: Math.round(predictedFill),
          confidence: confidence,
        },
      });

      return prediction;
    } catch (error) {
      console.error('Erreur lors de la prédiction:', error);
      throw error;
    }
  }

  /**
   * Prédire le remplissage pour tous les conteneurs
   */
  async predictAllContainers(targetDate = new Date()) {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const containers = await prisma.conteneur.findMany();
      const predictions = [];

      for (const container of containers) {
        const prediction = await this.predictContainerFill(container.id_conteneur, targetDate);
        predictions.push(prediction);
      }

      return predictions;
    } catch (error) {
      console.error('Erreur lors de la prédiction globale:', error);
      throw error;
    }
  }

  /**
   * Identifier les conteneurs qui seront critiques demain
   */
  async getCriticalPredictions(threshold = 80) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const predictions = await prisma.fillPrediction.findMany({
      where: {
        predicted_date: tomorrow,
        predicted_fill: { gte: threshold },
      },
      orderBy: { predicted_fill: 'desc' },
    });

    return predictions;
  }

  /**
   * Comparer la prédiction avec la valeur réelle
   */
  async validatePrediction(containerId, predictedDate, actualFill) {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const prediction = await prisma.fillPrediction.findFirst({
        where: {
          container_id: containerId,
          predicted_date: predictedDate,
        },
      });

      if (prediction) {
        await prisma.fillPrediction.update({
          where: { id: prediction.id },
          data: { actual_fill: actualFill },
        });
      }

      return prediction;
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      throw error;
    }
  }

  /**
   * Récupérer les tendances historiques d'un conteneur
   */
  async getContainerTrends(containerId, days = 30) {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const metrics = await prisma.containerMetrics.findMany({
        where: {
          container_id: containerId,
          date: {
            gte: startDate,
          },
        },
        orderBy: { date: 'asc' },
      });

      // Calculer les tendances
      const fillLevels = metrics.map(m => m.avg_fill_level);
      const trend = this.calculateTrend(fillLevels);

      return {
        containerId,
        days,
        data: metrics,
        trend: {
          direction: trend.direction,
          slope: trend.slope,
          average: fillLevels.length > 0 
            ? Math.round(fillLevels.reduce((a, b) => a + b, 0) / fillLevels.length) 
            : 0
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des tendances:', error);
      throw error;
    }
  }

  /**
   * Calculer la tendance (direction et pente)
   */
  calculateTrend(values) {
    if (values.length < 2) {
      return { direction: 'stable', slope: 0 };
    }

    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    let direction = 'stable';
    if (slope > 2) direction = 'increasing';
    else if (slope < -2) direction = 'decreasing';
    
    return { direction, slope: Math.round(slope * 100) / 100 };
  }
}

module.exports = new PredictionService();