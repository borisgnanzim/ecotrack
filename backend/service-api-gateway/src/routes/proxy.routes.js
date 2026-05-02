// src/routes/proxy.routes.js
/**
 * Routes proxy vers les microservices
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();
const PROXY_CONFIG = require('../config/proxy.config');
const auth = require('../middlewares/auth.middleware');


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connecter un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Identifiants incorrects
 *
 * /auth/register:
 *   post:
 *     summary: Inscrire un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Inscription réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Données d'entrée invalides
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
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé
 *   put:
 *     summary: Mettre à jour le profil de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname: { type: 'string' }
 *               lastname: { type: 'string' }
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Données d'entrée invalides
 *       401:
 *         description: Non autorisé
 */
router.use('/users', auth, createProxyMiddleware({
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
 * @swagger
 * /notifications:
 *   get:
 *     summary: Récupérer les notifications de l'utilisateur
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 *       401:
 *         description: Non autorisé
 *
 * /notifications/{id}/read:
 *   put:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Notification non trouvée
 */
router.use('/notifications', auth, createProxyMiddleware({
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
 * Forward vers la documentation Swagger du service Users
 * GET /docs/service-users -> http://localhost:3011/api-docs
 */
router.use(
  '/docs/service-users',
  createProxyMiddleware({
    target: PROXY_CONFIG.users.url,
    changeOrigin: true,
    /* preserve subpaths for assets */
    pathRewrite: {
      '^/*': '/api-docs/',
    },
    onError: (err, req, res) => {
      console.error('Proxy Error - Users API Docs:', err);
      res.status(503).json({
        error: 'Documentation Service Users indisponible',
        statusCode: 503,
        timestamp: new Date().toISOString(),
      });
    },
  })
);

/**
 * @swagger
 * /containers:
 *   get:
 *     summary: Récupérer la liste des conteneurs
 *     tags: [Containers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conteneurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Container'
 *       401:
 *         description: Non autorisé
 *   post:
 *     summary: Créer un nouveau conteneur
 *     tags: [Containers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Container'
 *     responses:
 *       201:
 *         description: Conteneur créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Container'
 *       400:
 *         description: Données d'entrée invalides
 *       401:
 *         description: Non autorisé
 *
 * /containers/{id}:
 *   get:
 *     summary: Récupérer les détails d'un conteneur
 *     tags: [Containers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails du conteneur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Container'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Conteneur non trouvé
 */
router.use('/containers', auth, createProxyMiddleware({
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

/**
 * @swagger
 * /routes:
 *   get:
 *     summary: Récupérer la liste des routes
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des routes
  *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Route'
 *       401:
 *         description: Non autorisé
 */

router.use('/routes', auth, createProxyMiddleware({
  target: PROXY_CONFIG.routes.url,
  changeOrigin: true,
  pathRewrite: {
    '^/routes': '/routes'
  },
  onError: (err, req, res) => {
    console.error('Proxy Error - Routes Service:', err);
    res.status(503).json({
      error: 'Service Routes indisponible',
      statusCode: 503,
      timestamp: new Date().toISOString()
    });
  }
}));

// Service Analytics

/**
 * @swagger
 * /analytics:
 *   get:
 *     summary: Récupérer les rapports d'analyses
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rapports d'analyses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AnalyticsReport'
 *       401:
 *         description: Non autorisé  
 */

router.use('/analytics', auth, createProxyMiddleware({
  target: PROXY_CONFIG.analytics.url,
  changeOrigin: true,
  pathRewrite: {
    '^/analytics': '/analytics'
  },
  onError: (err, req, res) => {
    console.error('Proxy Error - Analytics Service:', err);
    res.status(503).json({
      error: 'Service Analytics indisponible',
      statusCode: 503,
      timestamp: new Date().toISOString()
    });
  }
}));


module.exports = router;
