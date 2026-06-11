const express = require('express');
const ChallengeController = require('../controllers/challengeController');
const router = express.Router();

// Gestion globale des défis
/**
 * @swagger
 * /api/gamification/challenges:
 *   post:
 *     summary: 🎯 Créer un nouveau défi
 *     description: Crée un nouveau défi de gamification. Nécessite des droits d'administration.
 *     tags: [🎯 Défis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - pointsReward
 *               - startDate
 *               - endDate
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Défi Zéro Déchet"
 *               description:
 *                 type: string
 *                 example: "Collectez 100kg de déchets en une semaine."
 *               pointsReward:
 *                 type: integer
 *                 example: 200
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Défi créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Challenge'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Droits insuffisants
 * /api/gamification/challenges/active:
 *   get:
 *     summary: ⚡ Récupérer les défis actifs
 *     description: Retourne la liste de tous les défis actuellement actifs.
 *     tags: [🎯 Défis]
 *     responses:
 *       200:
 *         description: Liste des défis actifs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Challenge'
 *
 * /api/gamification/challenges/user/{userId}:
 *   get:
 *     summary: 👤 Récupérer les défis d'un utilisateur
 *     description: Retourne la liste des défis auxquels un utilisateur participe ou a participé.
 *     tags: [🎯 Défis]
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
 *         description: Liste des défis de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Challenge' # Ou un schéma spécifique pour les défis de l'utilisateur
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 *
 * /api/gamification/challenges/user/{userId}/join/{challengeId}:
 *   post:
 *     summary: 🤝 Rejoindre un défi
 *     description: Permet à un utilisateur de rejoindre un défi existant.
 *     tags: [🎯 Défis]
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
 *         name: challengeId
 *         required: true
 *         description: ID du défi à rejoindre
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Défi rejoint avec succès
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur ou défi non trouvé
 *       409:
 *         description: L'utilisateur participe déjà à ce défi
 *
 * /api/gamification/challenges/user/{userId}/progress/{challengeId}:
 *   put:
 *     summary: ⬆️ Mettre à jour la progression d'un défi
 *     description: Met à jour la progression d'un utilisateur dans un défi spécifique.
 *     tags: [🎯 Défis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progression mise à jour
 */
// Gestion globale des défis
router.post('/', ChallengeController.createChallenge);
router.get('/active', ChallengeController.getActiveChallenges);

// Défis spécifiques à l'utilisateur
router.get('/user/:userId', ChallengeController.getUserChallenges);
router.post('/user/:userId/join/:challengeId', ChallengeController.joinChallenge);
router.put('/user/:userId/progress/:challengeId', ChallengeController.updateChallengeProgress);

module.exports = router;