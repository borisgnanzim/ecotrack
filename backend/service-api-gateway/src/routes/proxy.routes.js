// src/routes/proxy.routes.js
/**
 * Routes proxy vers les microservices
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();
const PROXY_CONFIG = require('../config/proxy.config');

/**
 * Forward vers le service Users (Authentification)
 * POST /auth/login, POST /auth/register, etc.
 */
router.use('/auth', createProxyMiddleware({
  target: PROXY_CONFIG.users.url,
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/auth'
  },
  onError: (err, req, res) => {
    console.error('Proxy Error - Auth Service:', err);
    res.status(503).json({
      error: 'Service Users indisponible',
      statusCode: 503,
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * Forward vers le service Users (Gestion Utilisateurs)
 * GET /users/profile, PUT /users/profile, etc.
 */
router.use('/users', createProxyMiddleware({
  target: PROXY_CONFIG.users.url,
  changeOrigin: true,
  pathRewrite: {
    '^/users': '/users'
  },
  onError: (err, req, res) => {
    console.error('Proxy Error - Users Service:', err);
    res.status(503).json({
      error: 'Service Users indisponible',
      statusCode: 503,
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * Forward vers le service Users (Notifications)
 * GET /notifications, PUT /notifications/:id/read, etc.
 */
router.use('/notifications', createProxyMiddleware({
  target: PROXY_CONFIG.users.url,
  changeOrigin: true,
  pathRewrite: {
    '^/notifications': '/notifications'
  },
  onError: (err, req, res) => {
    console.error('Proxy Error - Notifications:', err);
    res.status(503).json({
      error: 'Service Notifications indisponible',
      statusCode: 503,
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * Forward vers le service Containers
 * GET /containers, POST /containers, GET /containers/:id, etc.
 */
router.use('/containers', createProxyMiddleware({
  target: PROXY_CONFIG.containers.url,
  changeOrigin: true,
  pathRewrite: {
    '^/containers': '/containers'
  },
  onError: (err, req, res) => {
    console.error('Proxy Error - Containers Service:', err);
    res.status(503).json({
      error: 'Service Containers indisponible',
      statusCode: 503,
      timestamp: new Date().toISOString()
    });
  }
}));

module.exports = router;
