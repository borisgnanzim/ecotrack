/**
 * Routes pour les anomalies
 */
const express = require('express');
const router = express.Router();
const anomalyController = require('../controllers/anomalyController');

/**
 * @swagger
 * /analytics/anomalies:
 *   get:
 *     summary: Lister les anomalies
 *     description: Retourne la liste de toutes les anomalies détectées
 *     tags: [Anomalies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filtrer par sévérité
 *       - in: query
 *         name: resolved
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut résolution
 *     responses:
 *       200:
 *         description: Liste des anomalies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Anomaly'
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.get('/anomalies', anomalyController.listAnomalies);

/**
 * @swagger
 * /analytics/anomalies/{id}:
 *   get:
 *     summary: Récupérer une anomalie
 *     description: Retourne les détails d'une anomalie spécifique
 *     tags: [Anomalies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'anomalie
 *     responses:
 *       200:
 *         description: Détails de l'anomalie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anomaly'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Anomalie non trouvée
 */
router.get('/anomalies/:id', anomalyController.getAnomaly);

/**
 * @swagger
 * /analytics/anomalies/detect:
 *   post:
 *     summary: Détecter les anomalies
 *     description: Lance la détection d'anomalies dans les données du système
 *     tags: [Anomalies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Détection lancée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: 'string' }
 *                 anomaliesDetected: { type: 'integer' }
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.post('/anomalies/detect', anomalyController.detectAnomalies);

/**
 * @swagger
 * /analytics/anomalies/{id}/resolve:
 *   patch:
 *     summary: Résoudre une anomalie
 *     description: Marque une anomalie comme résolue
 *     tags: [Anomalies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'anomalie
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolution:
 *                 type: string
 *                 description: Description de la résolution
 *     responses:
 *       200:
 *         description: Anomalie résolue
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anomaly'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Anomalie non trouvée
 */
router.patch('/anomalies/:id/resolve', anomalyController.resolveAnomaly);

/**
 * @swagger
 * /analytics/anomalies/stats:
 *   get:
 *     summary: Statistiques des anomalies
 *     description: Retourne les statistiques agrégées sur les anomalies
 *     tags: [Anomalies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des anomalies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total: { type: 'integer' }
 *                 resolved: { type: 'integer' }
 *                 pending: { type: 'integer' }
 *                 bySeverity: { type: 'object' }
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.get('/anomalies/stats', anomalyController.getAnomalyStats);

/**
 * @swagger
 * /analytics/anomalies/sensors/faulty:
 *   get:
 *     summary: Capteurs défaillants
 *     description: Retourne la liste des capteurs présentant des anomalies
 *     tags: [Anomalies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des capteurs défaillants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sensorId: { type: 'string' }
 *                   containerId: { type: 'integer' }
 *                   status: { type: 'string' }
 *                   lastUpdate: { type: 'string', format: 'date-time' }
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.get('/anomalies/sensors/faulty', anomalyController.getFaultySensors);

module.exports = router;