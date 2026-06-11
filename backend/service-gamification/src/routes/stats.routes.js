const express = require('express');
const StatsController = require('../controllers/statsController');
const router = express.Router();

// Statistiques agrégées
/**
 * @swagger
 * /api/gamification/stats/{userId}:
 *   get:
 *     summary: 📊 Récupérer les statistiques d'un utilisateur
 *     description: Retourne les statistiques de gamification agrégées pour un utilisateur spécifique (points, badges, défis complétés).
 *     tags: [📊 Classement]
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
 *         description: Statistiques de l'utilisateur récupérées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPoints: { type: integer, example: 1500 }
 *                 badgesEarned: { type: integer, example: 5 }
 *                 challengesCompleted: { type: integer, example: 3 }
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 */
// Statistiques agrégées
router.get('/:userId', StatsController.getUserStats);

module.exports = router;