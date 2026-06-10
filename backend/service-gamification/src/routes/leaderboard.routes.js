const express = require('express');
const LeaderboardController = require('../controllers/leaderboardController');
const router = express.Router();

// Classement des utilisateurs
router.get('/', LeaderboardController.getLeaderboard);

module.exports = router;