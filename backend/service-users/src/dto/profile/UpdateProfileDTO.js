const Validator = require('../Validator');
const ValidationError = require('../ValidationError');

/**
 * DTO pour la mise à jour du profil utilisateur
 */
class UpdateProfileDTO {
  constructor(data) {
    this.name = data?.name ? data.name.trim() : undefined;
    this.address = data?.address ? data.address.trim() : undefined;
    this.username = data?.username ? data.username.trim() : undefined;
    this.phone = data?.phone ? data.phone.trim() : undefined;
  }

  /**
   * Valide les données d'entrée
   * Les champs sont optionnels, seuls les champs fournis sont validés
   * @throws {ValidationError} Si les données ne sont pas valides
   */
  validate() {
    const errors = {};

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

    // Validation username (optionnel)
    if (this.username !== undefined && !Validator.isEmpty(this.username)) {
      if (!Validator.isUsername(this.username)) {
        errors.username = 'Nom d\'utilisateur invalide (minimum 3 caractères, sans espaces)';
      } else if (!Validator.maxLength(this.username, 50)) {
        errors.username = 'Nom d\'utilisateur trop long (max 50 caractères)';
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
   * Retourne les données validées (supprime les champs undefined)
   */
  toJSON() {
    const data = {};
    if (this.name !== undefined) data.name = this.name;
    if (this.address !== undefined) data.address = this.address;
    if (this.username !== undefined) data.username = this.username;
    if (this.phone !== undefined) data.phone = this.phone;
    return data;
  }
}

module.exports = UpdateProfileDTO;
