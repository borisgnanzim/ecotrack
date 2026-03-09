// src/config/proxy.config.js
/**
 * Configuration des proxies vers les microservices
 */

const PROXY_CONFIG = {
  users: {
    url: process.env.USERS_SERVICE_URL || 'http://localhost:3002',
    description: 'Service de gestion des utilisateurs et authentification',
    routes: ['/auth', '/users', '/notifications','/api-docs']
  },
  containers: {
    url: process.env.CONTAINERS_SERVICE_URL || 'http://localhost:3001',
    description: 'Service de gestion des conteneurs',
    routes: ['/containers']
  }
};

module.exports = PROXY_CONFIG;
