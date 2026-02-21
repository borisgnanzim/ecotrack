// src/routes/health.routes.js
/**
 * Routes pour la vérification de santé du gateway
 */

const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Vérifier l'état du gateway
 *     tags: [Health]
 *     description: Retourne l'état opérationnel du gateway et des services proxysés
 *     responses:
 *       200:
 *         description: Gateway en état de fonctionnement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 timestamp: { type: string, format: date-time }
 *                 uptime: { type: number }
 *                 environment: { type: string }
 */
router.get('/health', healthController.getHealth.bind(healthController));

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Récupérer les statistiques du gateway
 *     tags: [Health]
 *     description: Retourne les informations de charge et de performance du gateway
 *     responses:
 *       200:
 *         description: Statistiques du gateway
 */
router.get('/stats', healthController.getStats.bind(healthController));

module.exports = router;
