/**
 * Classe personnalisée pour les erreurs de validation
 */
class ValidationError extends Error {
  constructor(errors) {
    super('Erreur de validation');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

module.exports = ValidationError;
