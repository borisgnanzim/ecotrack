// src/utils/errors.js

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Données invalides") {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Ressource introuvable") {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Non authentifié") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Accès interdit") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflit de données") {
    super(message, 409);
  }
}

export class InternalError extends AppError {
  constructor(message = "Erreur serveur") {
    super(message, 500);
  }
}