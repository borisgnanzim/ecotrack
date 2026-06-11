/**
 * Service de statistiques utilisateur
 */
const { prisma } = require('../config/postgres');

class StatsService {
  static async getUserStats(userId) {
    const totalPointsResult = await prisma.userAction.aggregate({
      _sum: { points: true },
      where: { userId },
    });
    const totalPoints = totalPointsResult._sum.points || 0;

    const badgesCount = await prisma.userBadge.count({
      where: { userId },
    });

    const completedChallenges = await prisma.userChallenge.count({
      where: { userId, isCompleted: true },
    });

    // For rank, we'd need a more complex query or a materialized view
    return {
      userId,
      rank: null, // Placeholder, requires full leaderboard calculation
      totalPoints,
      badgesCount,
      completedChallenges,
    };
  }
}

module.exports = StatsService;