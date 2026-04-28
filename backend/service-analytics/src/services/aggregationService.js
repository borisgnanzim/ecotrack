const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Service d'agrégation des données pour l'analytics
 */
class AggregationService {
  
  /**
   * Agréger les données quotidiennes des conteneurs
   */
  async aggregateContainerDaily(containerId, date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      // Récupérer l'historique de remplissage pour la journée
      const fillHistory = await prisma.fillHistory.findMany({
        where: {
          conteneurId: containerId,
          recordedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: { recordedAt: 'asc' },
      });

      if (fillHistory.length === 0) {
        return null;
      }

      const levels = fillHistory.map(f => f.niveau);
      const avgFill = levels.reduce((a, b) => a + b, 0) / levels.length;
      const maxFill = Math.max(...levels);
      const minFill = Math.min(...levels);

      // Créer ou mettre à jour les métriques
      const metrics = await prisma.containerMetrics.upsert({
        where: {
          container_id_date: {
            container_id: containerId,
            date: startOfDay,
          },
        },
        create: {
          container_id: containerId,
          date: startOfDay,
          avg_fill_level: avgFill,
          max_fill_level: maxFill,
          min_fill_level: minFill,
          collection_count: fillHistory.length,
          total_weight: maxFill * 50, // Estimation: 50kg par niveau
        },
        update: {
          avg_fill_level: avgFill,
          max_fill_level: maxFill,
          min_fill_level: minFill,
          collection_count: fillHistory.length,
          total_weight: maxFill * 50,
        },
      });

      return metrics;
    } catch (error) {
      console.error('Erreur lors de l\'agrégation quotidienne:', error);
      throw error;
    }
  }

  /**
   * Agréger les données quotidiennes par zone
   */
  async aggregateZoneDaily(zoneId, date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    try {
      // Récupérer les conteneurs de la zone
      const containers = await prisma.conteneur.findMany({
        where: { id_Zone: zoneId },
      });

      if (containers.length === 0) {
        return null;
      }

      // Calculer les métriques agrégées
      let totalCritical = 0;
      let totalFill = 0;
      let collectionCount = 0;
      let totalWeight = 0;

      for (const container of containers) {
        const metrics = await prisma.containerMetrics.findFirst({
          where: {
            container_id: container.id_conteneur,
            date: startOfDay,
          },
        });

        if (metrics) {
          totalFill += metrics.avg_fill_level;
          collectionCount += metrics.collection_count;
          totalWeight += metrics.total_weight;
          if (metrics.max_fill_level >= 80) {
            totalCritical++;
          }
        }
      }

      const avgFill = containers.length > 0 ? totalFill / containers.length : 0;

      const zoneMetrics = await prisma.zoneMetrics.upsert({
        where: {
          zone_id_date: {
            zone_id: zoneId,
            date: startOfDay,
          },
        },
        create: {
          zone_id: zoneId,
          date: startOfDay,
          total_containers: containers.length,
          critical_count: totalCritical,
          avg_fill_level: avgFill,
          collection_count: collectionCount,
          total_weight: totalWeight,
        },
        update: {
          total_containers: containers.length,
          critical_count: totalCritical,
          avg_fill_level: avgFill,
          collection_count: collectionCount,
          total_weight: totalWeight,
        },
      });

      return zoneMetrics;
    } catch (error) {
      console.error('Erreur lors de l\'agrégation par zone:', error);
      throw error;
    }
  }

  /**
   * Agréger les données quotidiennes par agent
   */
  async aggregateAgentDaily(agentId, date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      // Récupérer les tournées de l'agent
      const routes = await prisma.route.findMany({
        where: {
          agent_id: agentId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          steps: true,
        },
      });

      const routesCompleted = routes.filter(r => r.status === 'completed').length;
      const routesPlanned = routes.length;
      let containersCollected = 0;
      let totalDistance = 0;
      let totalTime = 0;
      let totalFill = 0;

      for (const route of routes) {
        containersCollected += route.steps.length;
        totalDistance += route.total_distance || 0;
        totalTime += route.estimated_time || 0;
      }

      const avgFill = routesCompleted > 0 ? totalFill / routesCompleted : 0;

      const agentMetrics = await prisma.agentMetrics.upsert({
        where: {
          agent_id_date: {
            agent_id: agentId,
            date: startOfDay,
          },
        },
        create: {
          agent_id: agentId,
          date: startOfDay,
          routes_completed: routesCompleted,
          routes_planned: routesPlanned,
          containers_collected: containersCollected,
          total_distance: totalDistance,
          total_time: totalTime,
          avg_fill_level: avgFill,
        },
        update: {
          routes_completed: routesCompleted,
          routes_planned: routesPlanned,
          containers_collected: containersCollected,
          total_distance: totalDistance,
          total_time: totalTime,
          avg_fill_level: avgFill,
        },
      });

      return agentMetrics;
    } catch (error) {
      console.error('Erreur lors de l\'agrégation par agent:', error);
      throw error;
    }
  }

  /**
   * Agréger les données globales quotidiennes
   */
  async aggregateGlobalDaily(date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    try {
      // Compter les conteneurs
      const totalContainers = await prisma.conteneur.count();

      // Compter les conteneurs critiques (niveau >= 80)
      const criticalContainers = await prisma.containerMetrics.count({
        where: {
          date: startOfDay,
          max_fill_level: { gte: 80 },
        },
      });

      // Compter les collections
      const totalCollections = await prisma.containerMetrics.aggregate({
        where: { date: startOfDay },
        _sum: { collection_count: true },
      });

      // Compter les tournées actives
      const activeRoutes = await prisma.route.count({
        where: {
          date: startOfDay,
          status: 'in_progress',
        },
      });

      // Compter les tournées terminées
      const completedRoutes = await prisma.route.count({
        where: {
          date: startOfDay,
          status: 'completed',
        },
      });

      // Compter les agents actifs
      const activeAgents = await prisma.route.findMany({
        where: {
          date: startOfDay,
          status: { in: ['in_progress', 'completed'] },
        },
        distinct: ['agent_id'],
      });

      // Calculer le niveau de remplissage moyen
      const avgFillData = await prisma.containerMetrics.aggregate({
        where: { date: startOfDay },
        _avg: { avg_fill_level: true },
      });

      const dailyMetrics = await prisma.dailyMetrics.upsert({
        where: {
          date: startOfDay,
        },
        create: {
          date: startOfDay,
          total_containers: totalContainers,
          critical_containers: criticalContainers,
          total_collections: totalCollections._sum.collection_count || 0,
          total_weight: 0,
          active_routes: activeRoutes,
          completed_routes: completedRoutes,
          active_agents: activeAgents.length,
          signalements_today: 0,
          avg_fill_level: avgFillData._avg.avg_fill_level || 0,
        },
        update: {
          total_containers: totalContainers,
          critical_containers: criticalContainers,
          total_collections: totalCollections._sum.collection_count || 0,
          active_routes: activeRoutes,
          completed_routes: completedRoutes,
          active_agents: activeAgents.length,
          avg_fill_level: avgFillData._avg.avg_fill_level || 0,
        },
      });

      return dailyMetrics;
    } catch (error) {
      console.error('Erreur lors de l\'agrégation globale:', error);
      throw error;
    }
  }

  /**
   * Lancer l'agrégation quotidienne pour tous les éléments
   */
  async runDailyAggregation(date = new Date()) {
    const results = {
      containers: 0,
      zones: 0,
      agents: 0,
      global: null,
    };

    try {
      // Agréger tous les conteneurs
      const containers = await prisma.conteneur.findMany();
      for (const container of containers) {
        await this.aggregateContainerDaily(container.id_conteneur, date);
        results.containers++;
      }

      // Agréger toutes les zones
      const zones = [...new Set(containers.map(c => c.id_Zone))];
      for (const zoneId of zones) {
        await this.aggregateZoneDaily(zoneId, date);
        results.zones++;
      }

      // Agréger tous les agents
      const agents = await prisma.route.findMany({
        where: {
          date: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lte: new Date(date.setHours(23, 59, 59, 999)),
          },
        },
        distinct: ['agent_id'],
      });

      for (const route of agents) {
        if (route.agent_id) {
          await this.aggregateAgentDaily(route.agent_id, date);
          results.agents++;
        }
      }

      // Agrégation globale
      results.global = await this.aggregateGlobalDaily(date);

      return results;
    } catch (error) {
      console.error('Erreur lors de l\'agrégation quotidienne:', error);
      throw error;
    }
  }
}

module.exports = new AggregationService();