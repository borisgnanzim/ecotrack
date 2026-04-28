/**
 * Contrôleur pour les anomalies
 * GET /api/analytics/anomalies
 */
const anomalyService = require('../services/anomalyService');

/**
 * Lister les anomalies
 * GET /api/analytics/anomalies
 */
exports.listAnomalies = async (req, res, next) => {
    try {
        const { type, severity, isResolved, limit = 50, offset = 0 } = req.query;
        const anomalies = await anomalyService.listAnomalies({ 
            type, 
            severity, 
            isResolved: isResolved === 'true',
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            data: anomalies
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer une anomalie par ID
 * GET /api/analytics/anomalies/:id
 */
exports.getAnomaly = async (req, res, next) => {
    try {
        const { id } = req.params;
        const anomaly = await anomalyService.getAnomalyById(id);

        if (!anomaly) {
            return res.status(404).json({
                success: false,
                error: 'Anomalie non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            data: anomaly
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Détecter les anomalies automatiquement
 * POST /api/analytics/anomalies/detect
 */
exports.detectAnomalies = async (req, res, next) => {
    try {
        const { containerIds, date } = req.body;
        const anomalies = await anomalyService.detectAnomalies(containerIds, date ? new Date(date) : new Date());

        res.status(201).json({
            success: true,
            message: `${anomalies.length} anomalie(s) détectée(s)`,
            data: anomalies
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Résoudre une anomalie
 * PATCH /api/analytics/anomalies/:id/resolve
 */
exports.resolveAnomaly = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { resolution } = req.body;
        const anomaly = await anomalyService.resolveAnomaly(id, resolution);

        res.status(200).json({
            success: true,
            message: 'Anomalie résolue',
            data: anomaly
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer les statistiques d'anomalies
 * GET /api/analytics/anomalies/stats
 */
exports.getAnomalyStats = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await anomalyService.getAnomalyStats(startDate, endDate);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Détecter les capteurs défectueux
 * GET /api/analytics/anomalies/sensors/faulty
 */
exports.getFaultySensors = async (req, res, next) => {
    try {
        const sensors = await anomalyService.detectFaultySensors();

        res.status(200).json({
            success: true,
            data: sensors
        });
    } catch (error) {
        next(error);
    }
};