const StatsService = require('../services/statsService');

class StatsController {
  static async getUserStats(req, res, next) {
    try {
      const { userId } = req.params;
      const stats = await StatsService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StatsController;