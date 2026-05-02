/**
 * Routes pour les prédictions ML
 */
const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

/**
 * @swagger
 * /analytics/predictions/containers/{containerId}:
 *   get:
 *     summary: Prédiction pour un conteneur
 *     description: Retourne la prédiction de remplissage pour un conteneur spécifique
 *     tags: [Prédictions]
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
 *         description: Prédiction du conteneur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prediction'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Conteneur non trouvé
 */
router.get('/predictions/containers/:containerId', predictionController.predictContainer);

/**
 * @swagger
 * /analytics/predictions/containers:
 *   get:
 *     summary: Prédictions pour tous les conteneurs
 *     description: Retourne les prédictions de remplissage pour tous les conteneurs
 *     tags: [Prédictions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prédictions de tous les conteneurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prediction'
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.get('/predictions/containers', predictionController.predictAllContainers);

/**
 * @swagger
 * /analytics/predictions/critical:
 *   get:
 *     summary: Prédictions critiques
 *     description: Retourne les prédictions pour les conteneurs critiques (remplissage imminent)
 *     tags: [Prédictions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prédictions critiques
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prediction'
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.get('/predictions/critical', predictionController.getCriticalPredictions);

/**
 * @swagger
 * /analytics/predictions/validate:
 *   post:
 *     summary: Valider une prédiction
 *     description: Valide la précision d'une prédiction contre la valeur réelle
 *     tags: [Prédictions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               predictionId:
 *                 type: string
 *               actualValue:
 *                 type: number
 *             required: [predictionId, actualValue]
 *     responses:
 *       200:
 *         description: Prédiction validée
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.post('/predictions/validate', predictionController.validatePrediction);

/**
 * @swagger
 * /analytics/predictions/trends/{containerId}:
 *   get:
 *     summary: Tendances d'un conteneur
 *     description: Retourne les tendances de remplissage d'un conteneur sur une période
 *     tags: [Prédictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: containerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du conteneur
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Nombre de jours à considérer
 *     responses:
 *       200:
 *         description: Tendances du conteneur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trend: { type: 'string' }
 *                 dataPoints: { type: 'array' }
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Conteneur non trouvé
 */
router.get('/predictions/trends/:containerId', predictionController.getContainerTrends);

module.exports = router;