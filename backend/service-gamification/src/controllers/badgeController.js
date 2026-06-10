const BadgeService = require('../services/badgeService');

class BadgeController {
  static async getUserBadges(req, res, next) {
    try {
      const { userId } = req.params;
      const badges = await BadgeService.getUserBadges(userId);
      res.json({ userId, badges, count: badges.length });
    } catch (error) {
      next(error);
    }
  }

  static async awardBadge(req, res, next) {
    try {
      const { userId, badgeId } = req.params;
      const result = await BadgeService.awardBadge(userId, badgeId);

      if (!result) {
        return res.status(400).json({ error: 'Badge already awarded' });
      }

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BadgeController;