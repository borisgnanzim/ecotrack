// src/routes/cache.routes.js
/**
 * Routes pour la gestion du cache Redis
 */

const express = require('express');
const router = express.Router();
const cacheController = require('../controllers/cache.controller');

/**
 * @swagger
 * /cache/stats:
 *   get:
 *     summary: Statistiques du cache Redis
 *     tags: [Cache]
 *     description: Retourne les infos sur l'utilisation du cache Redis
 *     responses:
 *       200:
 *         description: Statistiques du cache
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cache: { type: object }
 *                 timestamp: { type: string, format: date-time }
 */
router.get('/cache/stats', cacheController.getStats.bind(cacheController));

/**
 * @swagger
 * /cache:
 *   delete:
 *     summary: Vider tout le cache
 *     tags: [Cache]
 *     description: Supprime tous les éléments du cache Redis
 *     responses:
 *       200:
 *         description: Cache vidé avec succès
 */
router.delete('/cache', cacheController.clearCache.bind(cacheController));

/**
 * @swagger
 * /cache/pattern/{pattern}:
 *   delete:
 *     summary: Vider le cache par pattern
 *     tags: [Cache]
 *     description: Supprime les éléments du cache qui matchent un pattern (containers:*)
 *     parameters:
 *       - in: path
 *         name: pattern
 *         required: true
 *         schema:
 *           type: string
 *         description: Pattern Redis ( containers:*, users:*)
 *     responses:
 *       200:
 *         description: Cache pattern supprimé
 */
router.delete('/cache/pattern/:pattern', cacheController.clearCachePattern.bind(cacheController));

/**
 * @swagger
 * /cache/key/{key}:
 *   delete:
 *     summary: Supprimer une clé du cache
 *     tags: [Cache]
 *     description: Supprime une clé spécifique du cache
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Clé à supprimer (URL encoded)
 *     responses:
 *       200:
 *         description: Clé supprimée
 */
router.delete('/cache/key/:key', cacheController.deleteCacheKey.bind(cacheController));

module.exports = router;
