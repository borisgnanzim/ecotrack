const express = require('express');
const GamificationService = require('../services/gamificationService');

const router = express.Router();

router.get('/points/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const points = await GamificationService.getUserPoints(userId);
    res.json(points);
  } catch (error) {
    next(error);
  }
});

router.post('/reward/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const reward = req.body.reward;
    const result = await GamificationService.awardReward(userId, reward);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
