const express = require('express');
const StatsController = require('../controllers/statsController');
const router = express.Router();

// Statistiques agrégées
router.get('/:userId', StatsController.getUserStats);

module.exports = router;