// src/routes/index.js
/**
 * Router principal: combine toutes les routes
 */

const express = require('express');
const router = express.Router();
const { cacheMiddleware, setCacheTTL } = require('../middlewares/cache.middleware');

const healthRoutes = require('./health.routes');
const documentationRoutes = require('./documentation.routes');
const cacheRoutes = require('./cache.routes');
const proxyRoutes = require('./proxy.routes');

// ===========================
// Routes sans cache
// ===========================
router.use(healthRoutes);
router.use(documentationRoutes);
router.use(cacheRoutes);

// ===========================
// Cache middleware (pour GET)
// ===========================
router.use(cacheMiddleware);

// ===========================
// Routes proxy with cache
// ===========================
// Cache des conteneurs (données qui changent rarement)
router.get('/containers', setCacheTTL(1800)); // 30 min
router.get('/containers/:id', setCacheTTL(1800));

// Cache des utilisateurs (données sensibles - cache court)
router.get('/users/profile', setCacheTTL(600)); // 10 min

// Cache des notifications (cache court, données temps réel)
router.get('/notifications', setCacheTTL(300)); // 5 min

// Appliquer les routes proxy
router.use(proxyRoutes);

module.exports = router;
