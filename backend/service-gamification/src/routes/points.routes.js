const express = require('express');
const PointsController = require('../controllers/pointsController');
const router = express.Router();

// Gestion des points et récompenses
router.post('/:userId', PointsController.addPoints);
router.get('/:userId', PointsController.getUserTotalPoints);

router.post('/reward/:userId', PointsController.awardReward);

module.exports = router;