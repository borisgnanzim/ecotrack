/**
 * Routes pour les prédictions ML
 * /api/analytics/predictions
 */
const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

// GET /api/analytics/predictions/containers/:containerId - Prédiction pour un conteneur
router.get('/predictions/containers/:containerId', predictionController.predictContainer);

// GET /api/analytics/predictions/containers - Prédictions pour tous les conteneurs
router.get('/predictions/containers', predictionController.predictAllContainers);

// GET /api/analytics/predictions/critical - Prédictions critiques
router.get('/predictions/critical', predictionController.getCriticalPredictions);

// POST /api/analytics/predictions/validate - Valider une prédiction
router.post('/predictions/validate', predictionController.validatePrediction);

// GET /api/analytics/predictions/trends/:containerId - Tendances d'un conteneur
router.get('/predictions/trends/:containerId', predictionController.getContainerTrends);

module.exports = router;