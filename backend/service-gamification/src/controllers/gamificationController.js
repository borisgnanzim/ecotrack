const GamificationService = require('../services/gamificationService');

class GamificationController {
  // ===== POINTS =====
  static async addPoints(req, res, next) {
    try {
      const { userId } = req.params;
      const { action, points } = req.body;

      if (!action) {
        return res.status(400).json({ error: 'Action is required' });
      }

      const result = await GamificationService.addPoints(userId, action, points);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUserTotalPoints(req, res, next) {
    try {
      const { userId } = req.params;
      const totalPoints = await GamificationService.getUserTotalPoints(userId);
      res.json({ userId, totalPoints });
    } catch (error) {
      next(error);
    }
  }

  // ===== BADGES =====
  static async getUserBadges(req, res, next) {
    try {
      const { userId } = req.params;
      const badges = await GamificationService.getUserBadges(userId);
      res.json({ userId, badges, count: badges.length });
    } catch (error) {
      next(error);
    }
  }

  static async awardBadge(req, res, next) {
    try {
      const { userId, badgeId } = req.params;
      const result = await GamificationService.awardBadge(userId, badgeId);

      if (!result) {
        return res.status(400).json({ error: 'Badge already awarded' });
      }

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===== CHALLENGES =====
  static async createChallenge(req, res, next) {
    try {
      const challenge = await GamificationService.createChallenge(req.body);
      res.status(201).json(challenge);
    } catch (error) {
      next(error);
    }
  }

  static async getActiveChallenges(req, res, next) {
    try {
      const challenges = await GamificationService.getActiveChallenges();
      res.json({ challenges, count: challenges.length });
    } catch (error) {
      next(error);
    }
  }

  static async joinChallenge(req, res, next) {
    try {
      const { userId, challengeId } = req.params;
      const participation = await GamificationService.joinChallenge(userId, challengeId);
      res.status(201).json(participation);
    } catch (error) {
      next(error);
    }
  }

  static async updateChallengeProgress(req, res, next) {
    try {
      const { userId, challengeId } = req.params;
      const { progressIncrement } = req.body;

      if (progressIncrement === undefined || progressIncrement <= 0) {
        return res.status(400).json({ error: 'Invalid progress increment' });
      }

      const result = await GamificationService.updateChallengeProgress(
        userId,
        challengeId,
        progressIncrement
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUserChallenges(req, res, next) {
    try {
      const { userId } = req.params;
      const challenges = await GamificationService.getUserChallenges(userId);
      res.json({ userId, challenges, count: challenges.length });
    } catch (error) {
      next(error);
    }
  }

  // ===== LEADERBOARD =====
  static async getLeaderboard(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const leaderboard = await GamificationService.getLeaderboard(Math.min(limit, 100));
      res.json({ leaderboard, count: leaderboard.length });
    } catch (error) {
      next(error);
    }
  }

  // ===== STATISTICS =====
  static async getUserStats(req, res, next) {
    try {
      const { userId } = req.params;
      const stats = await GamificationService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  // ===== REWARDS (Legacy endpoint) =====
  static async awardReward(req, res, next) {
    try {
      const { userId } = req.params;
      const { reward } = req.body;
      const result = await GamificationService.awardReward(userId, reward);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GamificationController;
