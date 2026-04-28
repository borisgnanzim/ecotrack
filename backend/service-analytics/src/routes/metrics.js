/**
 * Routes pour les métriques et KPIs
 * /api/analytics/metrics
 * /api/analytics/kpis
 */
const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');

// GET /api/analytics/metrics - Métriques en temps réel
router.get('/metrics', metricsController.getMetrics);

// GET /api/analytics/kpis - KPIs globaux
router.get('/kpis', metricsController.getKPIs);

// GET /api/analytics/zones/:zoneId/metrics - Métriques par zone
router.get('/zones/:zoneId/metrics', metricsController.getZoneMetrics);

// GET /api/analytics/containers/:containerId/metrics - Métriques par conteneur
router.get('/containers/:containerId/metrics', metricsController.getContainerMetrics);

// GET /api/analytics/history - Historique des métriques
router.get('/history', metricsController.getMetricsHistory);

module.exports = router;