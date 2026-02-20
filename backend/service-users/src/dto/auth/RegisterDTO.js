const Validator = require('../Validator');
const ValidationError = require('../ValidationError');

/**
 * DTO pour l'inscription utilisateur
 */
class RegisterDTO {
  constructor(data) {
    this.username = data?.username?.trim() || '';
    this.email = data?.email?.trim() || '';
    this.password = data?.password || '';
    this.passwordConfirm = data?.passwordConfirm || '';
  }

  /**
   * Valide les données d'entrée
   * @throws {ValidationError} Si les données ne sont pas valides
   */
  validate() {
    const errors = {};

    // Validation username
    if (Validator.isEmpty(this.username)) {
      errors.username = 'Nom d\'utilisateur est requis';
    } else if (!Validator.isUsername(this.username)) {
      errors.username = 'Nom d\'utilisateur invalide (minimum 3 caractères, sans espaces)';
    } else if (!Validator.maxLength(this.username, 50)) {
      errors.username = 'Nom d\'utilisateur trop long (max 50 caractères)';
    }

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
    } else if (!Validator.maxLength(this.password, 100)) {
      errors.password = 'Mot de passe trop long (max 100 caractères)';
    }

    // Validation passwordConfirm
    if (this.password !== this.passwordConfirm) {
      errors.passwordConfirm = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    return true;
  }

  /**
   * Retourne les données validées (sans passwordConfirm)
   */
  toJSON() {
    return {
      username: this.username,
      email: this.email,
      password: this.password
    };
  }
}

module.exports = RegisterDTO;
