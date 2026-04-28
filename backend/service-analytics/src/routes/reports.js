/**
 * Routes pour les rapports
 * /api/analytics/reports
 */
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// GET /api/analytics/reports - Lister les rapports
router.get('/reports', reportController.listReports);

// GET /api/analytics/reports/:id - Récupérer un rapport
router.get('/reports/:id', reportController.getReport);

// POST /api/analytics/reports/daily - Générer rapport quotidien
router.post('/reports/daily', reportController.generateDailyReport);

// POST /api/analytics/reports/weekly - Générer rapport hebdomadaire
router.post('/reports/weekly', reportController.generateWeeklyReport);

// POST /api/analytics/reports/monthly - Générer rapport mensuel
router.post('/reports/monthly', reportController.generateMonthlyReport);

// GET /api/analytics/reports/:id/export - Exporter un rapport
router.get('/reports/:id/export', reportController.exportReport);

// POST /api/analytics/reports/schedule - Planifier un rapport
router.post('/reports/schedule', reportController.scheduleReport);

module.exports = router;