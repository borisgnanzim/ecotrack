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
    const issues = zodError.errors ?? zodError.issues ?? [];

    issues.forEach(error => {
      const field = Array.isArray(error.path) ? error.path.join('.') : String(error.path || 'unknown');
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
