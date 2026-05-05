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
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      const error = new ValidationError({ email: 'Email déjà utilisé' });
      error.statusCode = 400;
      throw error;
    }

    const createData = {
      email: userData.email,
      password: userData.password,
      address: userData.address,
      phone: userData.phone
    };

    if (userData.firstname && userData.lastname) {
      createData.username = `${userData.firstname}${userData.lastname}`.replace(/\s+/g, '').toLowerCase();
      createData.name = `${userData.firstname} ${userData.lastname}`.trim();
    } else {
      if (userData.username) createData.username = userData.username;
      if (userData.name) createData.name = userData.name;
    }

    if (Array.isArray(userData.roleNames)) {
      const roleNames = userData.roleNames.length > 0 ? userData.roleNames : ['citizen'];
      const roles = await User.findRolesByName(roleNames);
      if (roles.length !== roleNames.length) {
        const missingRoles = roleNames.filter(rn => !roles.some(role => role.name === rn));
        const error = new ValidationError({ roleNames: `Rôles introuvables : ${missingRoles.join(', ')}` });
        error.statusCode = 400;
        throw error;
      }
      createData.roles = { connect: roles.map(role => ({ id: role.id })) };
    }

    const user = await User.create(createData);
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

    if (updateData.firstname || updateData.lastname) {
      const currentName = user.name || '';
      const [currentFirst = '', ...currentRest] = currentName.split(' ');
      const currentLast = currentRest.join(' ');
      const firstname = updateData.firstname || currentFirst;
      const lastname = updateData.lastname || currentLast;

      updateData.username = `${firstname}${lastname}`.replace(/\s+/g, '').toLowerCase();
      updateData.name = `${firstname} ${lastname}`.trim();

      delete updateData.firstname;
      delete updateData.lastname;
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

  /**
   * Récupérer les rôles d'un utilisateur
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getUserRoles(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new ValidationError({ id: 'Utilisateur non trouvé' });
      error.statusCode = 404;
      throw error;
    }
    return user.roles;
  }

  /**
   * Récupérer les utilisateurs par rôle
   * @param {string} roleName
   * @returns {Promise<Array>}
   */
  
  async getUsersByRole(roleName) {
    if (!roleName) {
      const error = new ValidationError({ role: 'Le nom du rôle est requis' });
      error.statusCode = 400;
      throw error;
    }
    return await User.findByRole(roleName);
  }
}

module.exports = new UserService();