const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const User = require('../models/User');
const notificationService = require('./notificationService');
const ValidationError = require('../dto/ValidationError');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRES_IN = '1h';

class AuthService {
  /**
   * Authentifier un utilisateur avec email et password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: string, user: object, roles: string[]}>}
   */
  async login(emailOrData, password) {
    let email = emailOrData;
    if (typeof emailOrData === 'object' && emailOrData !== null) {
      email = emailOrData.email;
      password = emailOrData.password;
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      const error = new ValidationError({ email: 'Utilisateur non trouvé' });
      error.statusCode = 404;
      throw error;
    }

    const isMatch = user.comparePassword
      ? await user.comparePassword(password)
      : bcryptjs.compareSync(password, user.password);
    if (!isMatch) {
      const error = new ValidationError({ password: 'Mot de passe incorrect' });
      error.statusCode = 401;
      throw error;
    }

    const token = this.generateToken(user);
    const roleNames = user.roles.map(r => r.name);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      roles: roleNames
    };
  }

  /**
   * Enregistrer un nouvel utilisateur
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: string, user: object}>}
   */
  async registerCitizen(dataOrFirstname, lastname, email, password) {
    let registrationData;

    if (typeof dataOrFirstname === 'object' && dataOrFirstname !== null) {
      registrationData = dataOrFirstname;
    } else {
      registrationData = {
        firstname: dataOrFirstname,
        lastname,
        email,
        password
      };
    }

    const { firstname, lastname: last = '', email: userEmail, password: userPassword, username, name, address, phone } = registrationData;

    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
      const error = new ValidationError({ email: 'Email déjà utilisé' });
      error.statusCode = 400;
      throw error;
    }

    const resolvedUsername = username
      || (firstname && last ? `${firstname}${last}`.replace(/\s+/g, '').toLowerCase() : undefined);
    const resolvedName = name || (firstname && last ? `${firstname} ${last}`.trim() : undefined);

    const createData = {
      username: resolvedUsername,
      email: userEmail,
      password: userPassword,
      name: resolvedName,
      address,
      phone
    };

    const user = await User.create(createData);

    if (User.addRole) {
      await User.addRole(user.id, 'citizen');
    }

    const userWithRoles = await User.findById(user.id);
    const roleNames = userWithRoles.roles.map(r => r.name);
    const token = this.generateToken(userWithRoles);

    notificationService.sendWelcomeNotification(userWithRoles).catch(err => console.error('Notification échouée:', err.message || err));

    return {
      token,
      user: userWithRoles,
      roles: roleNames
    };
  }

  /**
   * Générer un token JWT
   * @param {object} user
   * @returns {string}
   */
  generateToken(user) {
    const roleNames = user.roles?.map(r => r.name) || [];
    return jwt.sign(
      { id: user.id, roles: roleNames },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Vérifier et décoder un token JWT
   * @param {string} token
   * @returns {Promise<object>}
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Changer le mot de passe d'un utilisateur
   * @param {string} userId
   * @param {string} oldPassword
   * @param {string} newPassword
   * @returns {Promise<{message: string}>}
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);

    if (!user) {
      const error = new ValidationError({ id: 'Utilisateur non trouvé' });
      error.statusCode = 404;
      throw error;
    }

    // Verify old password
    const isMatch = user.comparePassword
      ? await user.comparePassword(oldPassword)
      : bcryptjs.compareSync(oldPassword, user.password);

    if (!isMatch) {
      const error = new ValidationError({ oldPassword: 'Ancien mot de passe incorrect' });
      error.statusCode = 401;
      throw error;
    }

    // Hash new password and update
    await User.update(userId, { password: newPassword }); // User.update will handle hashing if the model is set up for it, otherwise hash here.

    return { message: 'Mot de passe mis à jour avec succès' };
  }
}
module.exports = new AuthService();
