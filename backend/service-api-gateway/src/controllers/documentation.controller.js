// src/controllers/documentation.controller.js
/**
 * Contrôleur pour la documentation du gateway
 */

const gatewayService = require('../services/gateway.service');

class DocumentationController {
  /**
   * GET /
   * Retourne la documentation du gateway et liste les services disponibles
   */
  getGatewayInfo(req, res) {
    try {
      const info = gatewayService.getGatewayInfo();
      res.status(200).json(info);
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération du gateway info',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /services
   * Retourne la liste détaillée de tous les services proxy
   */
  getServices(req, res) {
    try {
      const services = gatewayService.getServicesInfo();
      res.status(200).json({
        services,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération des services',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new DocumentationController();
