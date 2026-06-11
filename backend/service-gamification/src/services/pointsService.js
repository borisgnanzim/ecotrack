/**
 * Service de gestion des points et récompenses
 */
const { prisma } = require('../config/postgres');
const GamificationPublisher = require('../../kafka/gamificationPublisher');
const BadgeService = require('./badgeService');

class PointsService {
  static async addPoints(userId, actionType, points = 10) {
    // Add points to UserAction history
    const userAction = await prisma.userAction.create({
      data: {
        userId,
        actionType,
        points,
      },
    });

    // Calculate total points for the user
    const totalPointsResult = await prisma.userAction.aggregate({
      _sum: {
        points: true,
      },
      where: {
        userId,
      },
    });
    const totalPoints = totalPointsResult._sum.points || 0;

    // Publish Kafka event
    await GamificationPublisher.publishPointsAwarded(userId, actionType, points, totalPoints);

    // Check for badges
    await BadgeService.checkAndAwardBadges(userId, totalPoints);

    return { userId, actionType, pointsAdded: points, totalPoints };
  }

  static async getUserTotalPoints(userId) {
    const totalPointsResult = await prisma.userAction.aggregate({
      _sum: {
        points: true,
      },
      where: { userId },
    });
    return totalPointsResult._sum.points || 0;
  }

  static async awardReward(userId, reward) {
    // TODO: Enregistrer l'attribution d'une récompense
    return { success: true, reward, awardedAt: new Date() };
  }
}

module.exports = PointsService;