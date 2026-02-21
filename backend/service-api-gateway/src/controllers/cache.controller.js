// src/controllers/cache.controller.js
/**
 * Contrôleur pour la gestion du cache
 */

const cacheService = require('../services/cache.service');

class CacheController {
  /**
   * GET /cache/stats
   * Retourne les statistiques du cache
   */
  async getStats(req, res) {
    try {
      const stats = await cacheService.getStats();
      res.status(200).json({
        cache: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération des stats du cache',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * DELETE /cache
   * Vide tout le cache
   */
  async clearCache(req, res) {
    try {
      const success = await cacheService.clear();
      if (success) {
        res.status(200).json({
          message: 'Cache cleared',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          error: 'Impossible de vider le cache',
          statusCode: 500,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors du vide du cache',
        statusCode: 500,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * DELETE /cache/pattern/:pattern
   * Vide le cache pour un pattern particulier
   */
  async clearCachePattern(req, res) {
    try {
      const { pattern } = req.params;
      const success = await cacheService.deletePattern(pattern);
      if (success) {
        res.status(200).json({
          message: `Cache cleared for pattern: ${pattern}`,
          pattern,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          error: 'Impossible de vider le cache pour ce pattern',
          statusCode: 500,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors du vide du cache',
        statusCode: 500,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * DELETE /cache/key/:key
   * Supprime une clé spécifique du cache
   */
  async deleteCacheKey(req, res) {
    try {
      const { key } = req.params;
      const decodedKey = decodeURIComponent(key);
      const success = await cacheService.delete(decodedKey);
      if (success) {
        res.status(200).json({
          message: `Cache key deleted: ${decodedKey}`,
          key: decodedKey,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          error: 'Impossible de supprimer la clé du cache',
          statusCode: 500,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la suppression de la clé',
        statusCode: 500,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new CacheController();
