/**
 * Service de gestion des badges
 */
class BadgeService {
  static async getUserBadges(userId) {
    // TODO: Requête DB pour lister les badges de l'utilisateur
    return [
      { id: '1', name: 'Éco-Recycleur', awardedAt: new Date() },
      { id: '2', name: 'Protecteur du Quartier', awardedAt: new Date() }
    ];
  }

  static async awardBadge(userId, badgeId) {
    // TODO: Logique pour vérifier si le badge est déjà possédé, sinon l'attribuer
    // Retourner null si déjà possédé
    return { userId, badgeId, awardedAt: new Date() };
  }
}

module.exports = BadgeService;