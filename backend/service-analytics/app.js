const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { swaggerUi, specs } = require('./swagger');

const app = express();

// Middlewares
app.use(helmet());

const allowedOrigins = [
  'http://localhost:3000', // Vue/React dev server
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  'http://localhost:5173', // Vite dev server
  'http://localhost:4173', // Vite preview
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173'
];

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Analytics API Docs'
}));

// Import des routes
const metricsRoutes = require('./src/routes/metrics');
const dashboardRoutes = require('./src/routes/dashboard');
const reportsRoutes = require('./src/routes/reports');
const predictionsRoutes = require('./src/routes/predictions');
const anomaliesRoutes = require('./src/routes/anomalies');

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'analytics',
    timestamp: new Date(),
  });
});

// Routes principales
app.get('/', (req, res) => {
  res.json({ 
    message: 'Service Analytics EcoTrack',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      metrics: '/analytics/metrics',
      kpis: '/analytics/kpis',
      dashboard: '/analytics/dashboard',
      reports: '/analytics/reports',
      predictions: '/analytics/predictions',
      anomalies: '/analytics/anomalies'
    }
  });
});

// Routes API
app.use('/analytics', metricsRoutes);
app.use('/analytics', dashboardRoutes);
app.use('/analytics', reportsRoutes);
app.use('/analytics', predictionsRoutes);
app.use('/analytics', anomaliesRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.message);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;