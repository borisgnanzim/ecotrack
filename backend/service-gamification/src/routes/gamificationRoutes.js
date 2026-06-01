const express = require('express');
const GamificationController = require('../controllers/gamificationController');

const router = express.Router();

// ===== POINTS ENDPOINTS =====
router.post('/points/:userId', GamificationController.addPoints);
router.get('/points/:userId', GamificationController.getUserTotalPoints);

// ===== BADGES ENDPOINTS =====
router.get('/users/:userId/badges', GamificationController.getUserBadges);
router.post('/users/:userId/badges/:badgeId', GamificationController.awardBadge);

// ===== CHALLENGES ENDPOINTS =====
router.post('/challenges', GamificationController.createChallenge);
router.get('/challenges', GamificationController.getActiveChallenges);
router.post('/users/:userId/challenges/:challengeId/join', GamificationController.joinChallenge);
router.put('/users/:userId/challenges/:challengeId/progress', GamificationController.updateChallengeProgress);
router.get('/users/:userId/challenges', GamificationController.getUserChallenges);

// ===== LEADERBOARD ENDPOINTS =====
router.get('/leaderboard', GamificationController.getLeaderboard);

// ===== STATISTICS ENDPOINTS =====
router.get('/users/:userId/stats', GamificationController.getUserStats);

// ===== REWARDS ENDPOINTS (Legacy) =====
router.post('/reward/:userId', GamificationController.awardReward);

module.exports = router;
