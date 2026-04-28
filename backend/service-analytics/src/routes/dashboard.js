/**
 * Routes pour le tableau de bord
 * /api/analytics/dashboard
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /api/analytics/dashboard - Dashboard temps réel
router.get('/dashboard', dashboardController.getDashboard);

// GET /api/analytics/dashboard/zones - Dashboard par zones
router.get('/dashboard/zones', dashboardController.getDashboardByZones);

// GET /api/analytics/dashboard/agents - Dashboard par agents
router.get('/dashboard/agents', dashboardController.getDashboardByAgents);

// GET /api/analytics/dashboard/alerts - Alertes actives
router.get('/dashboard/alerts', dashboardController.getActiveAlerts);

// GET /api/analytics/dashboard/realtime - Statistiques temps réel
router.get('/dashboard/realtime', dashboardController.getRealtimeStats);

module.exports = router;