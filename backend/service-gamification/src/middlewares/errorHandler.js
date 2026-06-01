// Middleware for error handling
class GameError extends Error {
  constructor(message, statusCode = 400, code = 'GAME_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode || 500,
    path: req.path,
    timestamp: new Date().toISOString(),
  });

  // Prisma errors
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Resource not found',
      code: 'NOT_FOUND',
      message: 'The requested resource does not exist',
    });
  }

  if (err.code === 'P2002') {
    return res.status(400).json({
      error: 'Unique constraint violation',
      code: 'ALREADY_EXISTS',
      message: 'This resource already exists',
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      error: 'Foreign key constraint failed',
      code: 'INVALID_REFERENCE',
      message: 'Referenced resource does not exist',
    });
  }

  // Custom GameError
  if (err instanceof GameError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.details,
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  });
};

const validateRequest = (requiredFields) => {
  return (req, res, next) => {
    const missing = requiredFields.filter(field => !req.body[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'VALIDATION_ERROR',
        missingFields: missing,
      });
    }

    next();
  };
};

module.exports = {
  GameError,
  errorHandler,
  validateRequest,
};
