/**
 * Service de statistiques utilisateur
 */
class StatsService {
  static async getUserStats(userId) {
    // TODO: Agrégation des données (points, badges, défis réussis)
    return {
      userId,
      rank: 12,
      totalPoints: 1500,
      badgesCount: 5,
      completedChallenges: 3
    };
  }
}

module.exports = StatsService;