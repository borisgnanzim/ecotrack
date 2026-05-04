const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { prisma } = require('../config/postgres');
const ValidationError = require('../dto/ValidationError');
const { lowercase } = require('zod');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRES_IN = '1h';

class AuthService {
  /**
   * Authentifier un utilisateur avec email et password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: string, user: object, roles: string[]}>}
   */
  async login(email, password) {
    const user = await User.findOne({ email });
    
    if (!user) {
      const error = new ValidationError({ email: 'Utilisateur non trouvé' });
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
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
  async registerCitizen(firstname, lastname, email, password) {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new ValidationError({ email: 'Email déjà utilisé' });
      error.statusCode = 400;
      throw error;
    }

    const username = lowercase(`${firstname}${lastname}`.replace(/\s+/g, ''));
    const name = `${firstname} ${lastname}`.trim();

    // Créer l'utilisateur
    const user = await User.create({ username, email, password, name });

    // Assigner le rôle "citizen" par défaut
    const citizenRole = await prisma.role.findUnique({ where: { name: 'citizen' } });
    if (citizenRole) {
      await prisma.user.update({
        where: { id: user.id },
        data: { roles: { connect: { id: citizenRole.id } } }
      });
    }

    // Récupérer l'utilisateur avec ses rôles
    const userWithRoles = await User.findById(user.id);
    const roleNames = userWithRoles.roles.map(r => r.name);
    const token = this.generateToken(userWithRoles);

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
}

module.exports = new AuthService();
