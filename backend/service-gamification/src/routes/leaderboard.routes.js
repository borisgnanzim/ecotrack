const express = require('express');
const LeaderboardController = require('../controllers/leaderboardController');
const router = express.Router();

// Classement des utilisateurs
/**
 * @swagger
 * /api/gamification/leaderboard:
 *   get:
 *     summary: 📊 Récupérer le classement mondial
 *     description: Retourne le classement des utilisateurs par points, avec pagination optionnelle.
 *     tags: [📊 Classement]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'utilisateurs à retourner
 *     responses:
 *       200:
 *         description: Classement récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LeaderboardEntry'
 */
// Classement des utilisateurs
router.get('/', LeaderboardController.getLeaderboard);

module.exports = router;