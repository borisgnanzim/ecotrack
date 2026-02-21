// src/services/gateway.service.js
/**
 * Service d'orchestration du Gateway
 * Gère la répartition et la configuration des proxies
 */

const PROXY_CONFIG = require('../config/proxy.config');

class GatewayService {
  /**
   * Récupère la configuration complète du gateway
   */
  getGatewayInfo() {
    return {
      name: 'EcoTrack API Gateway',
      version: '1.0.0',
      description: 'Passerelle API principale pour tous les microservices EcoTrack',
      endpoints: {
        documentation: 'http://localhost:3000/api-docs',
        health: 'http://localhost:3000/health',
        root: 'http://localhost:3000'
      },
      services: this.getServicesInfo()
    };
  }

  /**
   * Récupère les informations de tous les services proxy
   */
  getServicesInfo() {
    const services = {};
    
    Object.entries(PROXY_CONFIG).forEach(([key, config]) => {
      services[key] = {
        description: config.description,
        baseUrl: `http://localhost:3000${config.routes[0]}`,
        targetUrl: config.url,
        routes: config.routes,
        docs: this.getServiceDocUrl(key)
      };
    });

    return services;
  }

  /**
   * Récupère l'URL de documentation Swagger d'un service
   */
  getServiceDocUrl(serviceName) {
    const docPorts = {
      users: 3002,
      containers: 3001
    };
    return `http://localhost:${docPorts[serviceName]}/api-docs`;
  }

  /**
   * Vérifie l'état du gateway et des services
   */
  getHealthStatus() {
    return {
      status: 'API Gateway is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      proxies: this.getProxiesStatus()
    };
  }

  /**
   * Récupère l'état des proxies
   */
  getProxiesStatus() {
    const proxies = {};
    Object.entries(PROXY_CONFIG).forEach(([key, config]) => {
      proxies[key] = {
        targetUrl: config.url,
        routes: config.routes,
        status: 'configured' // Vous pouvez ajouter des checks réels ici
      };
    });
    return proxies;
  }

  /**
   * Récupère les statistiques du gateway
   */
  getStats() {
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      servicedProxies: Object.keys(PROXY_CONFIG).length
    };
  }
}

module.exports = new GatewayService();
