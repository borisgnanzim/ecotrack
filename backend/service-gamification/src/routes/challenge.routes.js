const express = require('express');
const ChallengeController = require('../controllers/challengeController');
const router = express.Router();

// Gestion globale des défis
router.post('/', ChallengeController.createChallenge);
router.get('/active', ChallengeController.getActiveChallenges);

// Défis spécifiques à l'utilisateur
router.get('/user/:userId', ChallengeController.getUserChallenges);
router.post('/user/:userId/join/:challengeId', ChallengeController.joinChallenge);
router.put('/user/:userId/progress/:challengeId', ChallengeController.updateChallengeProgress);

module.exports = router;