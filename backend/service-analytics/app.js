const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    endpoints: {
      metrics: '/api/analytics/metrics',
      kpis: '/api/analytics/kpis',
      dashboard: '/api/analytics/dashboard',
      reports: '/api/analytics/reports',
      predictions: '/api/analytics/predictions',
      anomalies: '/api/analytics/anomalies'
    }
  });
});

// Routes API
app.use('/api/analytics', metricsRoutes);
app.use('/api/analytics', dashboardRoutes);
app.use('/api/analytics', reportsRoutes);
app.use('/api/analytics', predictionsRoutes);
app.use('/api/analytics', anomaliesRoutes);

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