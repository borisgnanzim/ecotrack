const User = require('../models/User');
const ValidationError = require('../dto/ValidationError');

class ProfileService {
  /**
   * Récupérer le profil de l'utilisateur connecté
   * @param {string} userId
   * @param {string} baseUrl - ex: 'http://localhost:3002'
   * @returns {Promise<object>}
   */
  async getProfile(userId, baseUrl) {
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new ValidationError({ id: 'Utilisateur non trouvé' });
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name || null,
      address: user.address || null,
      roles: user.roles.map(r => r.name),
      avatar: this.formatAvatarPath(user.avatar, baseUrl),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  /**
   * Mettre à jour le profil de l'utilisateur connecté
   * @param {string} userId
   * @param {object} updateData - {name, address, username, phone}
   * @returns {Promise<object>}
   */
  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new ValidationError({ id: 'Utilisateur non trouvé' });
      error.statusCode = 404;
      throw error;
    }

    // Si username est modifié, vérifier l'unicité
    if (updateData.username && updateData.username !== user.username) {
      const existingUser = await User.find();
      if (existingUser.some(u => u.username === updateData.username && u.id !== userId)) {
        const error = new ValidationError({ username: 'Nom d\'utilisateur déjà utilisé' });
        error.statusCode = 400;
        throw error;
      }
    }

    const updatedUser = await User.update(userId, updateData);
    return updatedUser;
  }

  /**
   * Mettre à jour l'avatar de l'utilisateur
   * @param {string} userId
   * @param {string} avatarPath - chemin du fichier avatar
   * @returns {Promise<object>}
   */
  async updateAvatar(userId, avatarPath) {
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new ValidationError({ id: 'Utilisateur non trouvé' });
      error.statusCode = 404;
      throw error;
    }

    const updatedUser = await User.update(userId, { avatar: avatarPath });
    return updatedUser;
  }

  /**
   * Formater le chemin de l'avatar avec l'URL de base
   * @private
   */
  formatAvatarPath(avatarPath, baseUrl) {
    if (!avatarPath) {
      return `${baseUrl}/uploads/defaults/default_avatar.svg`;
    }
    return `${baseUrl}${avatarPath}`;
  }
}

module.exports = new ProfileService();
