const Validator = require('../Validator');
const ValidationError = require('../ValidationError');

/**
 * DTO pour la création d'un utilisateur (Admin)
 */
class CreateUserDTO {
  constructor(data) {
    this.username = data?.username?.trim() || '';
    this.email = data?.email?.trim() || '';
    this.password = data?.password || '';
    this.name = data?.name ? data.name.trim() : undefined;
    this.address = data?.address ? data.address.trim() : undefined;
    this.phone = data?.phone ? data.phone.trim() : undefined;
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

    // Validation name (optionnel)
    if (this.name !== undefined && !Validator.isEmpty(this.name)) {
      if (!Validator.maxLength(this.name, 100)) {
        errors.name = 'Nom trop long (max 100 caractères)';
      }
    }

    // Validation address (optionnel)
    if (this.address !== undefined && !Validator.isEmpty(this.address)) {
      if (!Validator.maxLength(this.address, 200)) {
        errors.address = 'Adresse trop longue (max 200 caractères)';
      }
    }

    // Validation phone (optionnel)
    if (this.phone !== undefined && !Validator.isEmpty(this.phone)) {
      if (!Validator.isPhoneNumber(this.phone)) {
        errors.phone = 'Numéro de téléphone invalide';
      }
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
    const data = {
      username: this.username,
      email: this.email,
      password: this.password
    };
    if (this.name !== undefined) data.name = this.name;
    if (this.address !== undefined) data.address = this.address;
    if (this.phone !== undefined) data.phone = this.phone;
    return data;
  }
}

module.exports = CreateUserDTO;
