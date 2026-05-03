/**
 * Routes pour les métriques et KPIs
 */
const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');

/**
 * @swagger
 * /analytics/metrics:
 *   get:
 *     summary: Récupérer les métriques en temps réel
 *     description: Retourne les métriques générales du système (conteneurs, efficacité de collecte, etc.)
 *     tags: [Métriques]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métriques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Metrics'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       500:
 *         description: Erreur serveur
 */
router.get('/metrics', metricsController.getMetrics);

/**
 * @swagger
 * /analytics/kpis:
 *   get:
 *     summary: Récupérer les KPIs globaux
 *     description: Retourne les indicateurs clés de performance du système
 *     tags: [KPIs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPIs récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/KPI'
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.get('/kpis', metricsController.getKPIs);

/**
 * @swagger
 * /analytics/zones/{zoneId}/metrics:
 *   get:
 *     summary: Récupérer les métriques d'une zone
 *     description: Retourne les métriques spécifiques à une zone géographique
 *     tags: [Métriques]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: zoneId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la zone
 *     responses:
 *       200:
 *         description: Métriques de la zone
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Metrics'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Zone non trouvée
 */
router.get('/zones/:zoneId/metrics', metricsController.getZoneMetrics);

/**
 * @swagger
 * /analytics/containers/{containerId}/metrics:
 *   get:
 *     summary: Récupérer les métriques d'un conteneur
 *     description: Retourne les métriques détaillées d'un conteneur spécifique
 *     tags: [Métriques]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: containerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du conteneur
 *     responses:
 *       200:
 *         description: Métriques du conteneur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Metrics'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Conteneur non trouvé
 */
router.get('/containers/:containerId/metrics', metricsController.getContainerMetrics);

/**
 * @swagger
 * /analytics/history:
 *   get:
 *     summary: Récupérer l'historique des métriques
 *     description: Retourne l'historique des métriques sur une période donnée
 *     tags: [Historique]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de début
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de fin
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [1h, 1d, 1w]
 *           default: 1d
 *         description: Intervalle d'agrégation
 *     responses:
 *       200:
 *         description: Historique des métriques
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.get('/history', metricsController.getMetricsHistory);

module.exports = router;