/**
 * Service de gestion des défis
 */
class ChallengeService {
  static async createChallenge(data) {
    // TODO: Création d'un nouveau défi en base
    return { id: 'new-id', ...data };
  }

  static async getActiveChallenges() {
    // TODO: Lister les défis en cours
    return [];
  }

  static async joinChallenge(userId, challengeId) {
    // TODO: Inscrire l'utilisateur au défi
    return { userId, challengeId, status: 'joined' };
  }

  static async updateChallengeProgress(userId, challengeId, progressIncrement) {
    // TODO: Mettre à jour la progression et vérifier si le défi est complété
    return { 
      userId, 
      challengeId, 
      currentProgress: 50, 
      target: 100, 
      isCompleted: false 
    };
  }

  static async getUserChallenges(userId) {
    // TODO: Lister les défis (en cours et finis) d'un utilisateur
    return [];
  }
}

module.exports = ChallengeService;