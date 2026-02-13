/**
 * DTO pour la réponse du profil utilisateur
 * Ce DTO transforme les données utilisateur en format de réponse uniforme
 */
class GetProfileDTO {
  constructor(user, baseUrl) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.name = user.name || null;
    this.address = user.address || null;
    this.roles = user.roles.map(r => r.name) || [];
    this.avatar = this.formatAvatarPath(user.avatar, baseUrl);
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  /**
   * Formate le chemin de l'avatar avec l'URL de base
   */
  formatAvatarPath(avatarPath, baseUrl) {
    if (!avatarPath) {
      return `${baseUrl}/uploads/defaults/default_avatar.svg`;
    }
    return `${baseUrl}${avatarPath}`;
  }

  /**
   * Retourne les données formatées
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      name: this.name,
      address: this.address,
      roles: this.roles,
      avatar: this.avatar,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = GetProfileDTO;
