const Validator = require('../Validator');
const ValidationError = require('../ValidationError');

/**
 * DTO pour la connexion utilisateur
 */
class LoginDTO {
  constructor(data) {
    this.email = data?.email?.trim() || '';
    this.password = data?.password || '';
  }

  /**
   * Valide les données d'entrée
   * @throws {ValidationError} Si les données ne sont pas valides
   */
  validate() {
    const errors = {};

    // Validation email
    if (Validator.isEmpty(this.email)) {
      errors.email = 'Email est requis';
    } else if (!Validator.isEmail(this.email)) {
      errors.email = 'Email invalide';
    }

    // Validation password
    if (Validator.isEmpty(this.password)) {
      errors.password = 'Mot de passe est requis';
    } else if (!Validator.isPassword(this.password)) {
      errors.password = 'Mot de passe invalide (minimum 6 caractères)';
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    return true;
  }

  /**
   * Retourne les données validées
   */
  toJSON() {
    return {
      email: this.email,
      password: this.password
    };
  }
}

module.exports = LoginDTO;
