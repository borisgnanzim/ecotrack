// src/config/proxy.config.js
/**
 * Configuration des proxies vers les microservices
 */

const PROXY_CONFIG = {
  users: {
    url: process.env.USERS_SERVICE_URL || 'http://localhost:3011',
    description: 'Service de gestion des utilisateurs et authentification',
    routes: ['/auth', '/users', '/notifications','/api-docs']
  },
  containers: {
    url: process.env.CONTAINERS_SERVICE_URL || 'http://localhost:3012',
    description: 'Service de gestion des conteneurs et zones',
    routes: ['/containers', '/zones']
  },
  routes: {
    url: process.env.ROUTES_SERVICE_URL || 'http://localhost:3013',
    description: 'Service de gestion des routes',
    routes: ['/routes']
  },
  analytics: {
    url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3014',
    description: 'Service de gestion des analyses et rapports',
    routes: ['/analytics']
  },
  iot: {
    url: process.env.IOT_SERVICE_URL || 'http://localhost:3015',
    description: 'Service de gestion des données IoT',
    routes: ['/iot']
  },
};

module.exports = PROXY_CONFIG;
