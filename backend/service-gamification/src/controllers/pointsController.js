const PointsService = require('../services/pointsService');

class PointsController {
  static async addPoints(req, res, next) {
    try {
      const { userId } = req.params;
      const { action, points } = req.body;

      if (!action) {
        return res.status(400).json({ error: 'Action is required' });
      }

      const result = await PointsService.addPoints(userId, action, points);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUserTotalPoints(req, res, next) {
    try {
      const { userId } = req.params;
      const totalPoints = await PointsService.getUserTotalPoints(userId);
      res.json({ userId, totalPoints });
    } catch (error) {
      next(error);
    }
  }

  static async awardReward(req, res, next) {
    try {
      const { userId } = req.params;
      const { reward } = req.body;
      const result = await PointsService.awardReward(userId, reward);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PointsController;