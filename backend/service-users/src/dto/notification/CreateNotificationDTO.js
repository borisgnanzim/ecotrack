const Validator = require('../Validator');
const ValidationError = require('../ValidationError');

/**
 * DTO pour la création d'une notification
 */
class CreateNotificationDTO {
  constructor(data) {
    this.userId = data?.userId || undefined;
    this.title = data?.title ? data.title.trim() : '';
    this.message = data?.message ? data.message.trim() : '';
    this.type = data?.type?.trim() || 'info'; // 'info', 'warning', 'error', 'success'
    this.isRead = data?.isRead || false;
  }

  /**
   * Valide les données d'entrée
   * @throws {ValidationError} Si les données ne sont pas valides
   */
  validate() {
    const errors = {};

    // Validation title (optionnel mais recommandé)
    if (Validator.isEmpty(this.title)) {
      errors.title = 'Titre requis';
    } else if (!Validator.maxLength(this.title, 200)) {
      errors.title = 'Titre trop long (max 200 caractères)';
    }

    // Validation message (requis)
    if (Validator.isEmpty(this.message)) {
      errors.message = 'Message requis';
    } else if (!Validator.maxLength(this.message, 1000)) {
      errors.message = 'Message trop long (max 1000 caractères)';
    }

    // Validation type
    const validTypes = ['info', 'warning', 'error', 'success'];
    if (!validTypes.includes(this.type)) {
      errors.type = `Type invalide (doit être: ${validTypes.join(', ')})`;
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
      title: this.title,
      message: this.message,
      type: this.type,
      isRead: this.isRead
    };
    if (this.userId !== undefined) data.userId = this.userId;
    return data;
  }
}

module.exports = CreateNotificationDTO;
