const ChallengeService = require('../services/challengeService');

class ChallengeController {
  static async createChallenge(req, res, next) {
    try {
      const challenge = await ChallengeService.createChallenge(req.body);
      res.status(201).json(challenge);
    } catch (error) {
      next(error);
    }
  }

  static async getActiveChallenges(req, res, next) {
    try {
      const challenges = await ChallengeService.getActiveChallenges();
      res.json({ challenges, count: challenges.length });
    } catch (error) {
      next(error);
    }
  }

  static async joinChallenge(req, res, next) {
    try {
      const { userId, challengeId } = req.params;
      const participation = await ChallengeService.joinChallenge(userId, challengeId);
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

      const result = await ChallengeService.updateChallengeProgress(
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
      const challenges = await ChallengeService.getUserChallenges(userId);
      res.json({ userId, challenges, count: challenges.length });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ChallengeController;