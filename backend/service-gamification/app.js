require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { errorHandler } = require('./src/middlewares/errorHandler');
const { swaggerUi, swaggerSpec } = require('./swagger');
const helmet = require('helmet');

const app = express();
// use of helmet for security headers
app.use(helmet());

// Parse ALLOWED_ORIGINS from environment (comma-separated list)
const getDefaultOrigins = () => [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3010',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  'http://127.0.0.1:3010',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173'
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0)
  : getDefaultOrigins();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      // Allow requests from non-browser clients (backend services, curl, etc.)
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());


// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Utilisation du routeur centralisé (index.js du dossier routes)
app.use('/api/gamification', require('./src/routes'));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'service-gamification',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);


module.exports = app;