// src/routes/index.js
/**
 * Router principal: combine toutes les routes
 */

const express = require('express');
const router = express.Router();

const healthRoutes = require('./health.routes');
const documentationRoutes = require('./documentation.routes');
const proxyRoutes = require('./proxy.routes');

// Enregistrer les routes
router.use(healthRoutes);
router.use(documentationRoutes);
router.use(proxyRoutes);

module.exports = router;
