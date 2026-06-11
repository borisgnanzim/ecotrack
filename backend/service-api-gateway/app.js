const express = require('express');
const cors = require('cors');
const { swaggerUi, swaggerSpec } = require('./swagger');
const { applyRateLimit } = require('./src/middlewares/rate-limit.middleware');
const { errorHandler, notFoundHandler } = require('./src/middlewares/error.middleware');
const routes = require('./src/routes');
const helmet = require('helmet');


const PORT = process.env.PORT || 3010;

const app = express();
// use of helmet for security headers
app.use(helmet());

// ===========================
// CORS Configuration
// ===========================
const getDefaultOrigins = () => [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:4173'
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0)
  : getDefaultOrigins();

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// ===========================
// Middlewares Globaux
// ===========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===========================
// Rate Limiting (sauf /health et /api-docs)
// ===========================
app.use(applyRateLimit);

// ===========================
// Documentation Swagger
// ===========================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'EcoTrack API Gateway'
}));



// ===========================
// Routes
// ===========================
app.use(routes);


// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;