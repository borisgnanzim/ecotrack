// src/routes/documentation.routes.js
/**
 * Routes pour la documentation du gateway
 */

const express = require('express');
const router = express.Router();
const documentationController = require('../controllers/documentation.controller');

/**
 * @swagger
 * /:
 *   get:
 *     summary: Infos du gateway
 *     tags: [Documentation]
 *     description: Retourne la documentation du gateway et la liste des services disponibles
 *     responses:
 *       200:
 *         description: Informations du gateway
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name: { type: string }
 *                 version: { type: string }
 *                 description: { type: string }
 *                 endpoints: { type: object }
 *                 services: { type: object }
 */
router.get('/', documentationController.getGatewayInfo.bind(documentationController));

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Liste des services proxysés
 *     tags: [Documentation]
 *     description: Retourne la liste détaillée de tous les services et leurs routes
 *     responses:
 *       200:
 *         description: Liste des services
 */
router.get('/services', documentationController.getServices.bind(documentationController));

module.exports = router;
