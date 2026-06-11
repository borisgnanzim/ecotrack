/**
 * Service de gestion des classements
 */
const { prisma } = require('../config/postgres');

class LeaderboardService {
  static async getLeaderboard(limit) {
    const leaderboard = await prisma.userAction.groupBy({
      by: ['userId'],
      _sum: {
        points: true,
      },
      orderBy: {
        _sum: {
          points: 'desc',
        },
      },
      take: limit,
    });
    return leaderboard.map((entry, index) => ({ rank: index + 1, userId: entry.userId, points: entry._sum.points }));
  }
}

module.exports = LeaderboardService;