/**
 * Routes pour les rapports
 */
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

/**
 * @swagger
 * /analytics/reports:
 *   get:
 *     summary: Lister les rapports
 *     description: Retourne la liste des rapports disponibles
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: Filtrer par type de rapport
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre de résultats
 *     responses:
 *       200:
 *         description: Liste des rapports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.get('/reports', reportController.listReports);

/**
 * @swagger
 * /analytics/reports/{id}:
 *   get:
 *     summary: Récupérer un rapport
 *     description: Retourne les détails d'un rapport spécifique
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du rapport
 *     responses:
 *       200:
 *         description: Détails du rapport
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Rapport non trouvé
 */
router.get('/reports/:id', reportController.getReport);

/**
 * @swagger
 * /analytics/reports/daily:
 *   post:
 *     summary: Générer un rapport quotidien
 *     description: Lance la génération d'un rapport quotidien
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Rapport généré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.post('/reports/daily', reportController.generateDailyReport);

/**
 * @swagger
 * /analytics/reports/weekly:
 *   post:
 *     summary: Générer un rapport hebdomadaire
 *     description: Lance la génération d'un rapport hebdomadaire
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Rapport généré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.post('/reports/weekly', reportController.generateWeeklyReport);

/**
 * @swagger
 * /analytics/reports/monthly:
 *   post:
 *     summary: Générer un rapport mensuel
 *     description: Lance la génération d'un rapport mensuel
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Rapport généré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.post('/reports/monthly', reportController.generateMonthlyReport);

/**
 * @swagger
 * /analytics/reports/{id}/export:
 *   get:
 *     summary: Exporter un rapport
 *     description: Exporte un rapport dans le format demandé
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du rapport
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, csv, json]
 *           default: pdf
 *         description: Format d'export
 *     responses:
 *       200:
 *         description: Rapport exporté
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Rapport non trouvé
 */
router.get('/reports/:id/export', reportController.exportReport);

/**
 * @swagger
 * /analytics/reports/schedule:
 *   post:
 *     summary: Programmer un rapport automatique
 *     description: Configure la génération automatique d'un rapport à intervalle régulier
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *               schedule:
 *                 type: string
 *                 description: Expression cron
 *               email:
 *                 type: string
 *                 description: Email pour la notification
 *             required: [type, schedule]
 *     responses:
 *       201:
 *         description: Rapport programmé
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.post('/reports/schedule', reportController.scheduleReport);

module.exports = router;