/**
 * Service de tableau de bord pour l'analytics
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class DashboardService {
    /**
     * Récupérer les données du dashboard
     */
    async getDashboardData(role = 'manager') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Métriques du jour
        const dailyMetrics = await prisma.dailyMetrics.findFirst({
            where: { date: today },
            orderBy: { date: 'desc' }
        });

        // Conteneurs critiques
        const criticalContainers = await prisma.containerMetrics.findMany({
            where: {
                date: today,
                max_fill_level: { gte: 80 }
            },
            take: 10,
            orderBy: { max_fill_level: 'desc' }
        });

        // Tournées en cours
        const activeRoutes = await prisma.route.findMany({
            where: {
                date: today,
                status: { in: ['in_progress', 'planned'] }
            },
            take: 10
        });

        // Signalements du jour
        const signalementsToday = await prisma.anomaly.count({
            where: {
                createdAt: {
                    gte: today,
                    lte: new Date()
                }
            }
        });

        // Anomalies non résolues
        const unresolvedAnomalies = await prisma.anomaly.findMany({
            where: { is_resolved: false },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Métriques par zone
        const zoneMetrics = await prisma.zoneMetrics.findMany({
            where: { date: today },
            orderBy: { critical_count: 'desc' },
            take: 10
        });

        const dashboard = {
            kpis: {
                totalContainers: dailyMetrics?.total_containers || 0,
                criticalContainers: dailyMetrics?.critical_containers || criticalContainers.length,
                activeRoutes: dailyMetrics?.active_routes || activeRoutes.length,
                completedRoutes: dailyMetrics?.completed_routes || 0,
                collectionsToday: dailyMetrics?.total_collections || 0,
                signalementsToday: signalementsToday,
                avgFillLevel: Math.round(dailyMetrics?.avg_fill_level || 0)
            },
            criticalContainers: criticalContainers,
            activeRoutes: activeRoutes,
            recentAnomalies: unresolvedAnomalies,
            zoneMetrics: zoneMetrics,
            timestamp: new Date().toISOString()
        };

        // Personnaliser selon le rôle
        if (role === 'admin') {
            dashboard.agentPerformance = await this.getAgentPerformance();
        }

        return dashboard;
    }

    /**
     * Récupérer le dashboard par zones
     */
    async getDashboardByZones() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const zones = await prisma.zoneMetrics.findMany({
            where: { date: today },
            orderBy: { critical_count: 'desc' }
        });

        return zones.map(zone => ({
            zoneId: zone.zone_id,
            totalContainers: zone.total_containers,
            criticalCount: zone.critical_count,
            avgFillLevel: zone.avg_fill_level,
            collectionCount: zone.collection_count,
            totalWeight: zone.total_weight
        }));
    }

    /**
     * Récupérer le dashboard par agents
     */
    async getDashboardByAgents(date = new Date()) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const agentMetrics = await prisma.agentMetrics.findMany({
            where: { date: startOfDay },
            orderBy: { routes_completed: 'desc' }
        });

        return agentMetrics.map(agent => ({
            agentId: agent.agent_id,
            routesCompleted: agent.routes_completed,
            routesPlanned: agent.routes_planned,
            containersCollected: agent.containers_collected,
            totalDistance: agent.total_distance,
            avgFillLevel: agent.avg_fill_level
        }));
    }

    /**
     * Récupérer les alertes actives
     */
    async getActiveAlerts(severity = null) {
        const where = { is_resolved: false };
        if (severity) {
            where.severity = severity;
        }

        const alerts = await prisma.anomaly.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return alerts.map(alert => ({
            id: alert.id,
            type: alert.type,
            severity: alert.severity,
            description: alert.description,
            containerId: alert.container_id,
            createdAt: alert.createdAt
        }));
    }

    /**
     * Récupérer les statistiques en temps réel
     */
    async getRealtimeStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Compteurs temps réel
        const totalContainers = await prisma.conteneur.count();
        const criticalContainers = await prisma.containerMetrics.count({
            where: {
                date: today,
                max_fill_level: { gte: 80 }
            }
        });
        const activeRoutes = await prisma.route.count({
            where: {
                date: today,
                status: 'in_progress'
            }
        });
        const unresolvedAnomalies = await prisma.anomaly.count({
            where: { is_resolved: false }
        });

        // Prédictions critiques pour demain
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const criticalPredictions = await prisma.fillPrediction.count({
            where: {
                predicted_date: tomorrow,
                predicted_fill: { gte: 80 }
            }
        });

        return {
            containers: {
                total: totalContainers,
                critical: criticalContainers,
                criticalPercentage: totalContainers > 0 ? Math.round((criticalContainers / totalContainers) * 100) : 0
            },
            routes: {
                active: activeRoutes
            },
            anomalies: {
                unresolved: unresolvedAnomalies
            },
            predictions: {
                criticalTomorrow: criticalPredictions
            },
            lastUpdate: new Date().toISOString()
        };
    }

    /**
     * Récupérer les performances des agents
     */
    async getAgentPerformance() {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);

        const agentMetrics = await prisma.agentMetrics.findMany({
            where: {
                date: { gte: startOfWeek }
            }
        });

        // Grouper par agent
        const byAgent = {};
        for (const metric of agentMetrics) {
            if (!byAgent[metric.agent_id]) {
                byAgent[metric.agent_id] = {
                    routesCompleted: 0,
                    containersCollected: 0,
                    totalDistance: 0
                };
            }
            byAgent[metric.agent_id].routesCompleted += metric.routes_completed;
            byAgent[metric.agent_id].containersCollected += metric.containers_collected;
            byAgent[metric.agent_id].totalDistance += metric.total_distance;
        }

        return Object.entries(byAgent).map(([agentId, data]) => ({
            agentId: parseInt(agentId),
            ...data
        }));
    }
}

module.exports = new DashboardService();