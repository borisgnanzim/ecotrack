const express = require('express');
const router = express.Router();
const SignalementController = require('../controllers/signalementController');

/**
 * @swagger
 * /api/gamification/signalement:
 *   post:
 *     summary: 🚩 Signaler une action et gagner des points
 *     description: Enregistre une action utilisateur (comme un signalement de conteneur) et met à jour ses points.
 *     tags: [🏆 Récompenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: "Action enregistrée et points mis à jour." }
 */
router.post('/', SignalementController.reportSignalement);

/**
 * @swagger
 * /api/gamification/signalement:
 *   get:
 *     summary: 📜 Lister tous les signalements
 *     description: Récupère la liste de toutes les actions de signalement. (Admin)
 *     tags: [🏆 Récompenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: "Liste de tous les signalements." }
 */
router.get('/', SignalementController.getAllSignalements);

/**
 * @swagger
 * /api/gamification/signalement/user/{userId}:
 *   get:
 *     summary: 🙋‍♂️ Lister mes signalements
 *     description: Récupère la liste des signalements effectués par un utilisateur spécifique.
 *     tags: [🏆 Récompenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: 'string' }
 *         description: ID de l'utilisateur.
 *     responses:
 *       200: { description: "Liste des signalements de l'utilisateur." }
 */
router.get('/user/:userId', SignalementController.getMySignalements);

/**
 * @swagger
 * /api/gamification/signalement/{id}:
 *   get:
 *     summary: 📄 Obtenir un signalement par ID
 *     description: Récupère les détails d'un signalement spécifique par son ID d'action.
 *     tags: [🏆 Récompenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string' }
 *         description: ID de l'action de signalement.
 *     responses:
 *       200: { description: "Détails du signalement." }
 */
router.get('/:id', SignalementController.getSignalementById);

module.exports = router;
