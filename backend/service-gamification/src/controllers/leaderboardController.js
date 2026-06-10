const LeaderboardService = require('../services/leaderboardService');

class LeaderboardController {
  static async getLeaderboard(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const leaderboard = await LeaderboardService.getLeaderboard(Math.min(limit, 100));
      res.json({ leaderboard, count: leaderboard.length });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LeaderboardController;