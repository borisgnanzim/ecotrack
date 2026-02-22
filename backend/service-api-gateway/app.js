const express = require('express');
const { swaggerUi, swaggerSpec } = require('./swagger');
const { applyRateLimit } = require('./src/middlewares/rate-limit.middleware');
const { errorHandler, notFoundHandler } = require('./src/middlewares/error.middleware');
const routes = require('./src/routes');

const app = express();

// ===========================
// Middlewares Globaux
// ===========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===========================
// Documentation Swagger
// ===========================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'EcoTrack API Gateway',
  swaggerOptions: {
    url: 'http://localhost:3000/api-docs'
  }
}));

// ===========================
// Rate Limiting (sauf /health et /api-docs)
// ===========================
app.use(applyRateLimit);

// ===========================
// Routes
// ===========================
app.use(routes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;