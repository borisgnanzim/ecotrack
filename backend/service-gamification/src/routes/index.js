const express = require('express');
const router = express.Router();

const pointsRoutes = require('./points.routes');
const badgeRoutes = require('./badge.routes');
const challengeRoutes = require('./challenge.routes');
const leaderboardRoutes = require('./leaderboard.routes');
const statsRoutes = require('./stats.routes');
const signalementRoutes = require('./signalement.route');

router.use('/points', pointsRoutes);
router.use('/badges', badgeRoutes);
router.use('/challenges', challengeRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/stats', statsRoutes);
router.use('/signalement', signalementRoutes); // Route: POST /api/gamification/signalement

module.exports = router;
