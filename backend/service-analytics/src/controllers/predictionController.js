/**
 * Contrôleur pour les prédictions ML
 * GET /api/analytics/predictions
 */
const predictionService = require('../services/predictionService');

/**
 * Prédire le remplissage d'un conteneur
 * GET /api/analytics/predictions/containers/:containerId
 */
exports.predictContainer = async (req, res, next) => {
    try {
        const { containerId } = req.params;
        const { date } = req.query;
        const prediction = await predictionService.predictContainerFill(
            containerId, 
            date ? new Date(date) : new Date()
        );

        res.status(200).json({
            success: true,
            data: prediction
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Prédire le remplissage de tous les conteneurs
 * GET /api/analytics/predictions/containers
 */
exports.predictAllContainers = async (req, res, next) => {
    try {
        const { date } = req.query;
        const predictions = await predictionService.predictAllContainers(
            date ? new Date(date) : new Date()
        );

        res.status(200).json({
            success: true,
            data: predictions,
            count: predictions.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer les prédictions critiques
 * GET /api/analytics/predictions/critical
 */
exports.getCriticalPredictions = async (req, res, next) => {
    try {
        const { threshold = 80 } = req.query;
        const predictions = await predictionService.getCriticalPredictions(parseInt(threshold));

        res.status(200).json({
            success: true,
            data: predictions,
            count: predictions.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Valider une prédiction avec la valeur réelle
 * POST /api/analytics/predictions/validate
 */
exports.validatePrediction = async (req, res, next) => {
    try {
        const { containerId, predictedDate, actualFill } = req.body;
        const result = await predictionService.validatePrediction(
            containerId,
            new Date(predictedDate),
            actualFill
        );

        res.status(200).json({
            success: true,
            message: 'Prédiction validée',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer les tendances historiques
 * GET /api/analytics/predictions/trends/:containerId
 */
exports.getContainerTrends = async (req, res, next) => {
    try {
        const { containerId } = req.params;
        const { days = 30 } = req.query;
        const trends = await predictionService.getContainerTrends(containerId, parseInt(days));

        res.status(200).json({
            success: true,
            data: trends
        });
    } catch (error) {
        next(error);
    }
};