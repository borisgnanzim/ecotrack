const express = require('express');
const BadgeController = require('../controllers/badgeController');
const router = express.Router();

// Gestion des badges
/**
 * @swagger
 * /api/gamification/badges/user/{userId}:
 *   get:
 *     summary: 🎖️ Récupérer les badges d'un utilisateur
 *     description: Retourne la liste de tous les badges obtenus par un utilisateur spécifique.
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
 *         description: Liste des badges de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserBadge'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 *   post:
 *     summary: 🏅 Attribuer un badge à un utilisateur
 *     description: Attribue un badge spécifique à un utilisateur.
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
 *       - in: path
 *         name: badgeId
 *         required: true
 *         description: ID du badge à attribuer
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Badge attribué avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserBadge'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur ou badge non trouvé
 */
// Gestion des badges
router.get('/user/:userId', BadgeController.getUserBadges);
router.post('/user/:userId/award/:badgeId', BadgeController.awardBadge);

module.exports = router;