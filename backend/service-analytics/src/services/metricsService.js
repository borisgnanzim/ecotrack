/**
 * Service de métriques pour l'analytics
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class MetricsService {
    /**
     * Récupérer les métriques en temps réel
     */
    async getRealTimeMetrics(period = 'today') {
        const now = new Date();
        let startDate, endDate;

        switch (period) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
                endDate = new Date();
                break;
            case 'month':
                startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 1);
                endDate = new Date();
                break;
            default:
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
        }

        // Métriques des conteneurs
        const containerMetrics = await prisma.containerMetrics.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        // Métriques des zones
        const zoneMetrics = await prisma.zoneMetrics.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        // Métriques quotidiennes
        const dailyMetrics = await prisma.dailyMetrics.findFirst({
            where: {
                date: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            },
            orderBy: { date: 'desc' }
        });

        return {
            containers: {
                total: containerMetrics.length,
                avgFillLevel: this.calculateAverage(containerMetrics, 'avg_fill_level'),
                criticalCount: containerMetrics.filter(m => m.max_fill_level >= 80).length
            },
            zones: {
                total: zoneMetrics.length,
                avgFillLevel: this.calculateAverage(zoneMetrics, 'avg_fill_level'),
                criticalZones: zoneMetrics.filter(z => z.critical_count > 0).length
            },
            daily: dailyMetrics || {
                total_collections: 0,
                critical_containers: 0,
                avg_fill_level: 0
            }
        };
    }

    /**
     * Récupérer les KPIs globaux
     */
    async getGlobalKPIs() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // KPIs stockés
        const storedKPIs = await prisma.kPI.findMany();

        // Calculer les KPIs dynamiques
        const dailyMetrics = await prisma.dailyMetrics.findFirst({
            where: { date: today },
            orderBy: { date: 'desc' }
        });

        const criticalContainers = await prisma.containerMetrics.count({
            where: {
                date: today,
                max_fill_level: { gte: 80 }
            }
        });

        const activeRoutes = await prisma.route.count({
            where: {
                date: today,
                status: { in: ['in_progress', 'planned'] }
            }
        });

        const unresolvedAnomalies = await prisma.anomaly.count({
            where: {
                is_resolved: false
            }
        });

        return {
            fillRate: {
                value: dailyMetrics?.avg_fill_level || 0,
                unit: '%',
                trend: 'stable'
            },
            criticalContainers: {
                value: criticalContainers,
                unit: 'units',
                trend: criticalContainers > 10 ? 'up' : 'down'
            },
            activeRoutes: {
                value: activeRoutes,
                unit: 'routes',
                trend: 'stable'
            },
            collectionsToday: {
                value: dailyMetrics?.total_collections || 0,
                unit: 'collections',
                trend: 'stable'
            },
            unresolvedAnomalies: {
                value: unresolvedAnomalies,
                unit: 'anomalies',
                trend: unresolvedAnomalies > 5 ? 'up' : 'down'
            },
            totalWeight: {
                value: dailyMetrics?.total_weight || 0,
                unit: 'kg',
                trend: 'stable'
            }
        };
    }

    /**
     * Récupérer les métriques par zone
     */
    async getZoneMetrics(zoneId, date = new Date()) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const metrics = await prisma.zoneMetrics.findFirst({
            where: {
                zone_id: zoneId,
                date: startOfDay
            }
        });

        return metrics || null;
    }

    /**
     * Récupérer les métriques par conteneur
     */
    async getContainerMetrics(containerId, date = new Date()) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const metrics = await prisma.containerMetrics.findFirst({
            where: {
                container_id: parseInt(containerId),
                date: startOfDay
            }
        });

        return metrics || null;
    }

    /**
     * Récupérer l'historique des métriques
     */
    async getMetricsHistory(metric, startDate, endDate, interval = 'day') {
        const start = new Date(startDate);
        const end = new Date(endDate);

        let data;
        switch (metric) {
            case 'fill_level':
                data = await prisma.dailyMetrics.findMany({
                    where: {
                        date: { gte: start, lte: end }
                    },
                    orderBy: { date: 'asc' },
                    select: {
                        date: true,
                        avg_fill_level: true,
                        critical_containers: true
                    }
                });
                break;
            case 'collections':
                data = await prisma.dailyMetrics.findMany({
                    where: {
                        date: { gte: start, lte: end }
                    },
                    orderBy: { date: 'asc' },
                    select: {
                        date: true,
                        total_collections: true,
                        total_weight: true
                    }
                });
                break;
            case 'routes':
                data = await prisma.dailyMetrics.findMany({
                    where: {
                        date: { gte: start, lte: end }
                    },
                    orderBy: { date: 'asc' },
                    select: {
                        date: true,
                        active_routes: true,
                        completed_routes: true
                    }
                });
                break;
            default:
                data = await prisma.dailyMetrics.findMany({
                    where: {
                        date: { gte: start, lte: end }
                    },
                    orderBy: { date: 'asc' }
                });
        }

        return data;
    }

    /**
     * Calculer la moyenne d'un tableau de données
     */
    calculateAverage(data, field) {
        if (!data || data.length === 0) return 0;
        const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
        return Math.round((sum / data.length) * 100) / 100;
    }
}

module.exports = new MetricsService();