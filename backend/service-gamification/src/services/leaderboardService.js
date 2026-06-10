/**
 * Service de gestion des classements
 */
class LeaderboardService {
  static async getLeaderboard(limit) {
    // TODO: Requête complexe pour classer les utilisateurs par points décroissants
    return [
      { rank: 1, userId: 'u1', points: 5000 },
      { rank: 2, userId: 'u2', points: 4500 }
    ].slice(0, limit);
  }
}

module.exports = LeaderboardService;