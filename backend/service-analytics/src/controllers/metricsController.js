/**
 * Contrôleur pour les métriques et KPIs
 * GET /api/analytics/metrics
 * GET /api/analytics/kpis
 */
const metricsService = require('../services/metricsService');

/**
 * Récupérer les métriques en temps réel
 * GET /api/analytics/metrics
 */
exports.getMetrics = async (req, res, next) => {
    try {
        const { period = 'today' } = req.query;
        const metrics = await metricsService.getRealTimeMetrics(period);

        res.status(200).json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer les KPIs globaux
 * GET /api/analytics/kpis
 */
exports.getKPIs = async (req, res, next) => {
    try {
        const kpis = await metricsService.getGlobalKPIs();

        res.status(200).json({
            success: true,
            data: kpis
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer les métriques par zone
 * GET /api/analytics/zones/:zoneId/metrics
 */
exports.getZoneMetrics = async (req, res, next) => {
    try {
        const { zoneId } = req.params;
        const { date } = req.query;
        const metrics = await metricsService.getZoneMetrics(zoneId, date);

        res.status(200).json({
            success: true,
            data: metrics
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer les métriques par conteneur
 * GET /api/analytics/containers/:containerId/metrics
 */
exports.getContainerMetrics = async (req, res, next) => {
    try {
        const { containerId } = req.params;
        const { date } = req.query;
        const metrics = await metricsService.getContainerMetrics(containerId, date);

        res.status(200).json({
            success: true,
            data: metrics
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer l'historique des métriques
 * GET /api/analytics/history
 */
exports.getMetricsHistory = async (req, res, next) => {
    try {
        const { metric, startDate, endDate, interval = 'day' } = req.query;
        const history = await metricsService.getMetricsHistory(metric, startDate, endDate, interval);

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        next(error);
    }
};