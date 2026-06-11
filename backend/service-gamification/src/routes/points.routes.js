const express = require('express');
const PointsController = require('../controllers/pointsController');
const router = express.Router();

// Gestion des points et récompenses
/**
 * @swagger
 * /api/gamification/points/{userId}:
 *   post:
 *     summary: ➕ Ajouter des points à un utilisateur
 *     description: Ajoute un nombre spécifié de points à l'utilisateur et enregistre l'action.
 *     tags: [🏆 Récompenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - points
 *               - actionType
 *             properties:
 *               points:
 *                 type: integer
 *                 description: Nombre de points à ajouter
 *                 example: 50
 *               actionType:
 *                 type: string
 *                 description: Type d'action ayant généré les points (ex: 'container_report', 'challenge_completed')
 *                 example: "container_report"
 *     responses:
 *       200:
 *         description: Points ajoutés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Points'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 *   get:
 *     summary: 📈 Récupérer le total des points d'un utilisateur
 *     description: Retourne le solde total des points d'un utilisateur spécifique.
 *     tags: [🏆 Récompenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Total des points récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Points'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 */
// Gestion des points et récompenses
router.post('/:userId', PointsController.addPoints);
router.get('/:userId', PointsController.getUserTotalPoints);

router.post('/reward/:userId', PointsController.awardReward);

module.exports = router;