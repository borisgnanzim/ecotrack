/**
 * Service de gestion des badges
 */
const { prisma } = require('../config/postgres');
const GamificationPublisher = require('../../kafka/gamificationPublisher');

class BadgeService {
  static async getUserBadges(userId) {
    return prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    });
  }

  static async awardBadge(userId, badgeId) {
    const existingAward = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId,
        },
      },
    });

    if (existingAward) {
      return null; // Badge already awarded
    }

    const awardedBadge = await prisma.userBadge.create({
      data: {
        userId,
        badgeId,
      },
      include: { badge: true },
    });

    // Publish Kafka event
    await GamificationPublisher.publishBadgeEarned(userId, awardedBadge.badgeId, awardedBadge.badge.name);

    return awardedBadge;
  }

  static async checkAndAwardBadges(userId, totalPoints) {
    const availableBadges = await prisma.badge.findMany({
      where: {
        pointsRequired: {
          lte: totalPoints, // Less than or equal to total points
        },
      },
    });

    for (const badge of availableBadges) {
      await this.awardBadge(userId, badge.id); // awardBadge handles duplicates
    }
  }
}

module.exports = BadgeService;