const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');

const app = express();


// Configuration du rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite à 100 requêtes par IP par fenêtre
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard.',
  standardHeaders: true, // Retourne les headers rate limit (RFC 6585)
  legacyHeaders: false, // Désactive les headers X-RateLimit
});

// Appliquer le rate limiting à toutes les routes
app.use(limiter);

// Proxy vers service-users
app.use('/auth', createProxyMiddleware({ target: process.env.USERS_SERVICE_URL, changeOrigin: true }));
app.use('/users', createProxyMiddleware({ target: process.env.USERS_SERVICE_URL, changeOrigin: true }));
app.use('/notifications', createProxyMiddleware({ target: process.env.USERS_SERVICE_URL, changeOrigin: true }));

// Proxy vers service-containers
app.use('/containers', createProxyMiddleware({ target: process.env.CONTAINERS_SERVICE_URL, changeOrigin: true }));

// Route de santé pour vérifier l'API Gateway
app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway is running' });
});

module.exports = app;