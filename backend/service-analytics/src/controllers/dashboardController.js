/**
 * Contrôleur pour les tableaux de bord
 * GET /api/analytics/dashboard
 */
const dashboardService = require('../services/dashboardService');

/**
 * Récupérer le dashboard temps réel
 * GET /api/analytics/dashboard
 */
exports.getDashboard = async (req, res, next) => {
    try {
        const { role = 'manager' } = req.query;
        const dashboard = await dashboardService.getDashboardData(role);

        res.status(200).json({
            success: true,
            data: dashboard,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer les données du dashboard par zone
 * GET /api/analytics/dashboard/zones
 */
exports.getDashboardByZones = async (req, res, next) => {
    try {
        const dashboard = await dashboardService.getDashboardByZones();

        res.status(200).json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer les données du dashboard par agent
 * GET /api/analytics/dashboard/agents
 */
exports.getDashboardByAgents = async (req, res, next) => {
    try {
        const { date } = req.query;
        const dashboard = await dashboardService.getDashboardByAgents(date);

        res.status(200).json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer les alertes actives
 * GET /api/analytics/dashboard/alerts
 */
exports.getActiveAlerts = async (req, res, next) => {
    try {
        const { severity } = req.query;
        const alerts = await dashboardService.getActiveAlerts(severity);

        res.status(200).json({
            success: true,
            data: alerts
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer les statistiques en temps réel
 * GET /api/analytics/dashboard/realtime
 */
exports.getRealtimeStats = async (req, res, next) => {
    try {
        const stats = await dashboardService.getRealtimeStats();

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};