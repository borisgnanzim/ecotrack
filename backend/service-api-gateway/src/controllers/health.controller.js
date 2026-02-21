// src/controllers/health.controller.js
/**
 * Contrôleur pour les vérifications de santé du gateway
 */

const gatewayService = require('../services/gateway.service');

class HealthController {
  /**
   * GET /health
   * Retourne l'état du gateway
   */
  getHealth(req, res) {
    try {
      const health = gatewayService.getHealthStatus();
      res.status(200).json(health);
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la vérification de santé',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /stats
   * Retourne les statistiques du gateway
   */
  getStats(req, res) {
    try {
      const stats = gatewayService.getStats();
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération des statistiques',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new HealthController();
