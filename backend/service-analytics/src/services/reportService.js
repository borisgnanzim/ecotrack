/**
 * Service de génération de rapports pour l'analytics
 * Inclut export PDF/Excel et planification
 */
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class ReportService {
  constructor() {
    this.fs = require('fs');
    this.path = require('path');
    this.scheduledJobs = new Map();
  }

  /**
   * Lister les rapports
   */
  async listReports({ type, period, status, limit = 20, offset = 0 }) {
    const where = {};
    if (type) where.type = type;
    if (period) where.period = period;
    if (status) where.status = status;

    const reports = await prisma.report.findMany({
      where,
      orderBy: { generated_at: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.report.count({ where });

    return { data: reports, total, limit, offset };
  }

  /**
   * Récupérer un rapport par ID
   */
  async getReportById(id) {
    return await prisma.report.findUnique({
      where: { id: parseInt(id) }
    });
  }

  /**
   * Générer un rapport quotidien
   */
  async generateDailyReport(date = new Date()) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      // Récupérer les métriques quotidiennes
      const dailyMetrics = await prisma.dailyMetrics.findUnique({
        where: { date: startOfDay },
      });

      // Récupérer les métriques par zone
      const zoneMetrics = await prisma.zoneMetrics.findMany({
        where: { date: startOfDay },
        orderBy: { critical_count: 'desc' },
      });

      // Récupérer les anomalies du jour
      const anomalies = await prisma.anomaly.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: new Date(date.setHours(23, 59, 59, 999)),
          },
        },
        orderBy: { severity: 'desc' },
      });

      // Récupérer les conteneurs critiques
      const criticalContainers = await prisma.containerMetrics.findMany({
        where: {
          date: startOfDay,
          max_fill_level: { gte: 80 },
        },
        take: 10,
        orderBy: { max_fill_level: 'desc' },
      });

      const report = {
        type: 'daily',
        date: startOfDay,
        summary: {
          totalContainers: dailyMetrics?.total_containers || 0,
          criticalContainers: dailyMetrics?.critical_containers || 0,
          totalCollections: dailyMetrics?.total_collections || 0,
          activeRoutes: dailyMetrics?.active_routes || 0,
          completedRoutes: dailyMetrics?.completed_routes || 0,
          avgFillLevel: dailyMetrics?.avg_fill_level || 0,
        },
        zones: zoneMetrics,
        anomalies: anomalies.length,
        criticalContainers: criticalContainers,
      };

      // Sauvegarder le rapport
      const reportRecord = await prisma.report.create({
        data: {
          type: 'daily',
          period: 'day',
          title: `Rapport quotidien - ${startOfDay.toLocaleDateString('fr-FR')}`,
          file_format: 'json',
          status: 'completed',
        },
      });

      return { report, reportId: reportRecord.id };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport quotidien:', error);
      throw error;
    }
  }

  /**
   * Générer un rapport hebdomadaire
   */
  async generateWeeklyReport(weekStart = new Date()) {
    try {
      const startOfWeek = new Date(weekStart);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Agréger les données de la semaine
      const dailyMetrics = await prisma.dailyMetrics.findMany({
        where: {
          date: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
        orderBy: { date: 'asc' },
      });

      // Calculer les totaux
      const totals = dailyMetrics.reduce(
        (acc, day) => ({
          totalContainers: acc.totalContainers + (day.total_containers || 0),
          criticalContainers: acc.criticalContainers + (day.critical_containers || 0),
          totalCollections: acc.totalCollections + (day.total_collections || 0),
          completedRoutes: acc.completedRoutes + (day.completed_routes || 0),
        }),
        { totalContainers: 0, criticalContainers: 0, totalCollections: 0, completedRoutes: 0 }
      );

      // Récupérer les anomalies de la semaine
      const anomalies = await prisma.anomaly.findMany({
        where: {
          createdAt: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
      });

      const report = {
        type: 'weekly',
        period: { start: startOfWeek, end: endOfWeek },
        summary: {
          ...totals,
          daysWithData: dailyMetrics.length,
          avgDailyCollections: dailyMetrics.length > 0 
            ? Math.round(totals.totalCollections / dailyMetrics.length) 
            : 0,
        },
        dailyBreakdown: dailyMetrics,
        anomaliesByType: this.groupAnomaliesByType(anomalies),
      };

      const reportRecord = await prisma.report.create({
        data: {
          type: 'weekly',
          period: 'week',
          title: `Rapport hebdomadaire - Semaine du ${startOfWeek.toLocaleDateString('fr-FR')}`,
          file_format: 'json',
          status: 'completed',
        },
      });

      return { report, reportId: reportRecord.id };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport hebdomadaire:', error);
      throw error;
    }
  }

  /**
   * Générer un rapport mensuel
   */
  async generateMonthlyReport(year, month) {
    try {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);

      // Agréger les données du mois
      const dailyMetrics = await prisma.dailyMetrics.findMany({
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        orderBy: { date: 'asc' },
      });

      // Calculer les totaux et moyennes
      const totals = dailyMetrics.reduce(
        (acc, day) => ({
          totalContainers: acc.totalContainers + (day.total_containers || 0),
          criticalContainers: acc.criticalContainers + (day.critical_containers || 0),
          totalCollections: acc.totalCollections + (day.total_collections || 0),
          completedRoutes: acc.completedRoutes + (day.completed_routes || 0),
          totalWeight: acc.totalWeight + (day.total_weight || 0),
        }),
        {
          totalContainers: 0,
          criticalContainers: 0,
          totalCollections: 0,
          completedRoutes: 0,
          totalWeight: 0,
        }
      );

      // Récupérer les anomalies du mois
      const anomalies = await prisma.anomaly.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      // Métriques par zone
      const zoneMetrics = await prisma.zoneMetrics.findMany({
        where: {
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      });

      const zonesSummary = this.aggregateZoneMetrics(zoneMetrics);

      const report = {
        type: 'monthly',
        period: { year, month, start: startOfMonth, end: endOfMonth },
        summary: {
          ...totals,
          daysWithData: dailyMetrics.length,
          avgDailyCollections: dailyMetrics.length > 0 
            ? Math.round(totals.totalCollections / dailyMetrics.length) 
            : 0,
          avgFillLevel:
            dailyMetrics.length > 0
              ? Math.round(
                  dailyMetrics.reduce((acc, d) => acc + (d.avg_fill_level || 0), 0) /
                    dailyMetrics.length
                )
              : 0,
        },
        zones: zonesSummary,
        anomalies: {
          total: anomalies.length,
          byType: this.groupAnomaliesByType(anomalies),
          bySeverity: this.groupAnomaliesBySeverity(anomalies),
        },
        dailyBreakdown: dailyMetrics,
      };

      const reportRecord = await prisma.report.create({
        data: {
          type: 'monthly',
          period: 'month',
          title: `Rapport mensuel - ${startOfMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
          file_format: 'json',
          status: 'completed',
        },
      });

      return { report, reportId: reportRecord.id };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport mensuel:', error);
      throw error;
    }
  }

  /**
   * Exporter un rapport en format spécifique (PDF, Excel, CSV, JSON)
   */
  async exportReport(reportId, format = 'json') {
    try {
      const reportRecord = await prisma.report.findUnique({
        where: { id: parseInt(reportId) },
      });

      if (!reportRecord) {
        throw new Error('Rapport non trouvé');
      }

      let content;
      let mimeType;
      let extension;
      let filename;

      switch (format) {
        case 'pdf':
          content = await this.generatePDF(reportRecord);
          mimeType = 'application/pdf';
          extension = 'pdf';
          filename = `rapport_${reportRecord.type}_${reportRecord.period}.pdf`;
          break;
        case 'excel':
          content = await this.generateExcel(reportRecord);
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          extension = 'xlsx';
          filename = `rapport_${reportRecord.type}_${reportRecord.period}.xlsx`;
          break;
        case 'csv':
          content = this.generateCSV(reportRecord);
          mimeType = 'text/csv';
          extension = 'csv';
          filename = `rapport_${reportRecord.type}_${reportRecord.period}.csv`;
          break;
        default:
          content = JSON.stringify(reportRecord, null, 2);
          mimeType = 'application/json';
          extension = 'json';
          filename = `rapport_${reportRecord.type}_${reportRecord.period}.json`;
      }

      return {
        content,
        mimeType,
        extension,
        filename,
      };
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      throw error;
    }
  }

  /**
   * Générer un PDF
   */
  async generatePDF(report) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // En-tête
        doc.fontSize(20).text('EcoTrack - Rapport Analytique', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text(report.title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Type: ${report.type} | Période: ${report.period}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Généré le: ${report.generated_at.toLocaleDateString('fr-FR')}`, { align: 'center' });
        doc.moveDown(2);

        // Statut
        doc.fontSize(14).text('Statut du rapport');
        doc.fontSize(10).text(`Statut: ${report.status}`);
        doc.moveDown(2);

        // Pied de page
        doc.fontSize(8).text('EcoTrack - Service Analytics', 50, doc.page.height - 50);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Générer un Excel
   */
  async generateExcel(report) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'EcoTrack';
    workbook.created = new Date();

    // Feuille Résumé
    const summarySheet = workbook.addWorksheet('Résumé');
    summarySheet.columns = [
      { header: 'Champ', key: 'field', width: 30 },
      { header: 'Valeur', key: 'value', width: 30 }
    ];

    summarySheet.addRows([
      { field: 'Type', value: report.type },
      { field: 'Période', value: report.period },
      { field: 'Titre', value: report.title },
      { field: 'Statut', value: report.status },
      { field: 'Date de génération', value: report.generated_at.toISOString() }
    ]);

    summarySheet.getRow(1).font = { bold: true };

    // Convertir en buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * Générer un CSV
   */
  generateCSV(report) {
    const data = {
      type: report.type,
      period: report.period,
      title: report.title,
      status: report.status,
      generated_at: report.generated_at
    };

    try {
      const parser = new Parser();
      return parser.parse([data]);
    } catch (error) {
      // Fallback si json2csv échoue
      return Object.entries(data).map(([k, v]) => `${k},${v}`).join('\n');
    }
  }

  /**
   * Planifier un rapport automatique
   */
  async scheduleReport({ type, frequency, recipients, config }) {
    try {
      // Créer l'entrée dans la base de données
      const schedule = await prisma.report.create({
        data: {
          type: type,
          period: frequency,
          title: `Rapport planifié - ${type} (${frequency})`,
          file_format: config?.format || 'json',
          status: 'pending',
          recipient_email: recipients?.join(',')
        }
      });

      // Planifier avec node-cron
      const cronExpression = this.getCronExpression(frequency);
      
      if (cronExpression) {
        const job = cron.schedule(cronExpression, async () => {
          console.log(`Génération automatique du rapport ${type} pour ${frequency}`);
          try {
            if (type === 'daily') {
              await this.generateDailyReport();
            } else if (type === 'weekly') {
              await this.generateWeeklyReport();
            } else if (type === 'monthly') {
              const now = new Date();
              await this.generateMonthlyReport(now.getFullYear(), now.getMonth() + 1);
            }
          } catch (error) {
            console.error('Erreur lors de la génération automatique:', error);
          }
        });

        this.scheduledJobs.set(schedule.id, job);
      }

      return schedule;
    } catch (error) {
      console.error('Erreur lors de la planification:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'expression cron selon la fréquence
   */
  getCronExpression(frequency) {
    switch (frequency) {
      case 'day':
        return '0 6 * * *'; // Tous les jours à 6h
      case 'week':
        return '0 6 * * 1'; // Tous les lundis à 6h
      case 'month':
        return '0 6 1 * *'; // Le 1er du mois à 6h
      default:
        return null;
    }
  }

  /**
   * Grouper les anomalies par type
   */
  groupAnomaliesByType(anomalies) {
    return anomalies.reduce((acc, anomaly) => {
      const type = anomaly.type;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type]++;
      return acc;
    }, {});
  }

  /**
   * Grouper les anomalies par sévérité
   */
  groupAnomaliesBySeverity(anomalies) {
    return anomalies.reduce((acc, anomaly) => {
      const severity = anomaly.severity;
      if (!acc[severity]) {
        acc[severity] = 0;
      }
      acc[severity]++;
      return acc;
    }, {});
  }

  /**
   * Agréger les métriques par zone
   */
  aggregateZoneMetrics(zoneMetrics) {
    const zones = {};

    for (const metric of zoneMetrics) {
      if (!zones[metric.zone_id]) {
        zones[metric.zone_id] = {
          zone_id: metric.zone_id,
          total_containers: 0,
          critical_count: 0,
          collection_count: 0,
          count: 0,
        };
      }

      zones[metric.zone_id].total_containers += metric.total_containers;
      zones[metric.zone_id].critical_count += metric.critical_count;
      zones[metric.zone_id].collection_count += metric.collection_count;
      zones[metric.zone_id].count++;
    }

    // Calculer les moyennes
    return Object.values(zones).map((zone) => ({
      ...zone,
      avg_critical: Math.round(zone.critical_count / zone.count),
      avg_collections: Math.round(zone.collection_count / zone.count),
    }));
  }
}

module.exports = new ReportService();