const { ZodError } = require('zod');

/**
 * Classe personnalisée pour les erreurs de validation
 */
class ValidationError extends Error {
  constructor(errors) {
    super('Erreur de validation');
    this.name = 'ValidationError';
    this.errors = errors;
  }

  /**
   * Crée une ValidationError à partir d'une erreur Zod
   * @param {ZodError} zodError
   * @returns {ValidationError}
   */
  static fromZodError(zodError) {
    const errors = {};

    zodError.errors.forEach(error => {
      const field = error.path.join('.');
      if (!errors[field]) {
        errors[field] = error.message;
      } else if (Array.isArray(errors[field])) {
        errors[field].push(error.message);
      } else {
        errors[field] = [errors[field], error.message];
      }
    });

    return new ValidationError(errors);
  }
}

module.exports = ValidationError;
