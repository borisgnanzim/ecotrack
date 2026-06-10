const express = require('express');
const BadgeController = require('../controllers/badgeController');
const router = express.Router();

// Gestion des badges
router.get('/user/:userId', BadgeController.getUserBadges);
router.post('/user/:userId/award/:badgeId', BadgeController.awardBadge);

module.exports = router;