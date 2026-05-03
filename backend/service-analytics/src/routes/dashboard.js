/**
 * Routes pour le tableau de bord
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Récupérer le tableau de bord général
 *     description: Retourne les données complètes du tableau de bord avec métriques, KPIs et alertes
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du tableau de bord
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dashboard'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       500:
 *         description: Erreur serveur
 */
router.get('/dashboard', dashboardController.getDashboard);

/**
 * @swagger
 * /analytics/dashboard/zones:
 *   get:
 *     summary: Tableau de bord par zones
 *     description: Retourne les données du tableau de bord groupées par zones géographiques
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du tableau de bord par zones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 zones:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.get('/dashboard/zones', dashboardController.getDashboardByZones);

/**
 * @swagger
 * /analytics/dashboard/agents:
 *   get:
 *     summary: Tableau de bord par agents
 *     description: Retourne les données du tableau de bord groupées par agents de collecte
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du tableau de bord par agents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agents:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.get('/dashboard/agents', dashboardController.getDashboardByAgents);

/**
 * @swagger
 * /analytics/dashboard/alerts:
 *   get:
 *     summary: Récupérer les alertes actives
 *     description: Retourne la liste des alertes actives du système
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filtrer par sévérité
 *     responses:
 *       200:
 *         description: Liste des alertes actives
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.get('/dashboard/alerts', dashboardController.getActiveAlerts);

/**
 * @swagger
 * /analytics/dashboard/realtime:
 *   get:
 *     summary: Statistiques en temps réel
 *     description: Retourne les statistiques actualisées en temps réel du système
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques en temps réel
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activeCollections: { type: 'integer' }
 *                 pendingRoutes: { type: 'integer' }
 *                 filledContainers: { type: 'integer' }
 *                 efficiency: { type: 'number' }
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.get('/dashboard/realtime', dashboardController.getRealtimeStats);

module.exports = router;