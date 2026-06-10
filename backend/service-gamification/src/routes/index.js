const express = require('express');
const router = express.Router();

const pointsRoutes = require('./points.routes');
const badgeRoutes = require('./badge.routes');
const challengeRoutes = require('./challenge.routes');
const leaderboardRoutes = require('./leaderboard.routes');
const statsRoutes = require('./stats.routes');

router.use('/points', pointsRoutes);
router.use('/badges', badgeRoutes);
router.use('/challenges', challengeRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
