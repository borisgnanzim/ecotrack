const User = require('../models/User');
const ValidationError = require('../dto/ValidationError');

class UserService {
  /**
   * Récupérer tous les utilisateurs
   * @returns {Promise<Array>}
   */
  async getAllUsers() {
    return await User.find();
  }

  /**
   * Récupérer tous les utilisateurs avec pagination
   * @param {object} options - { page, limit }
   * @returns {Promise<Array>}
   */
  async getAllUsersWithPagination(options) {
    return await User.findPaginated(options);
  }

  /**
   * Récupérer un utilisateur par ID
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getUserById(id) {
    const user = await User.findById(id);
    
    if (!user) {
      const error = new ValidationError({ id: 'Utilisateur non trouvé' });
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Créer un nouvel utilisateur
   * @param {object} userData - {username, email, password, name, address, phone}
   * @returns {Promise<object>}
   */
  async createUser(userData) {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      const error = new ValidationError({ email: 'Email déjà utilisé' });
      error.statusCode = 400;
      throw error;
    }

    const user = await User.create(userData);
    return user;
  }

  /**
   * Mettre à jour un utilisateur
   * @param {string} id
   * @param {object} updateData
   * @returns {Promise<object>}
   */
  async updateUser(id, updateData) {
    const user = await User.findById(id);
    
    if (!user) {
      const error = new ValidationError({ id: 'Utilisateur non trouvé' });
      error.statusCode = 404;
      throw error;
    }

    // Si email est modifié, vérifier qu'il n'existe pas
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser) {
        const error = new ValidationError({ email: 'Email déjà utilisé' });
        error.statusCode = 400;
        throw error;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    return updatedUser;
  }

  /**
   * Supprimer un utilisateur
   * @param {string} id
   * @returns {Promise<object>}
   */
  async deleteUser(id) {
    const user = await User.findById(id);
    
    if (!user) {
      const error = new ValidationError({ id: 'Utilisateur non trouvé' });
      error.statusCode = 404;
      throw error;
    }

    await User.findByIdAndDelete(id);
    return { message: 'Utilisateur supprimé avec succès' };
  }

  /**
   * Ajouter un rôle à un utilisateur
   * @param {string} userId
   * @param {string} roleName
   * @returns {Promise<object>}
   */
  async addRole(userId, roleName) {
    return await User.addRole(userId, roleName);
  }

  /**
   * Retirer un rôle d'un utilisateur
   * @param {string} userId
   * @param {string} roleName
   * @returns {Promise<object>}
   */
  async removeRole(userId, roleName) {
    return await User.removeRole(userId, roleName);
  }

  /**
   * Mettre à jour les rôles d'un utilisateur
   * @param {string} userId
   * @param {Array} roleNames
   * @returns {Promise<object>}
   */
  async updateRoles(userId, roleNames) {
    return await User.updateRoles(userId, roleNames);
  }
}

module.exports = new UserService();