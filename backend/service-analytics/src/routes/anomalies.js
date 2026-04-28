/**
 * Routes pour les anomalies
 * /api/analytics/anomalies
 */
const express = require('express');
const router = express.Router();
const anomalyController = require('../controllers/anomalyController');

// GET /api/analytics/anomalies - Lister les anomalies
router.get('/anomalies', anomalyController.listAnomalies);

// GET /api/analytics/anomalies/:id - Récupérer une anomalie
router.get('/anomalies/:id', anomalyController.getAnomaly);

// POST /api/analytics/anomalies/detect - Détecter les anomalies
router.post('/anomalies/detect', anomalyController.detectAnomalies);

// PATCH /api/analytics/anomalies/:id/resolve - Résoudre une anomalie
router.patch('/anomalies/:id/resolve', anomalyController.resolveAnomaly);

// GET /api/analytics/anomalies/stats - Statistiques d'anomalies
router.get('/anomalies/stats', anomalyController.getAnomalyStats);

// GET /api/analytics/anomalies/sensors/faulty - Capteurs défectueux
router.get('/anomalies/sensors/faulty', anomalyController.getFaultySensors);

module.exports = router;