require('dotenv').config();
const app = require('./app');
const cacheService = require('./src/services/cache.service');

const PORT = process.env.PORT || 3010;

/**
 * Initialiser Redis et démarrer le serveur
 */
async function startServer() {
  try {
    // Initialiser Redis (optionnel)
    console.log('Initializing Redis Cache...');
    try {
      await cacheService.connect();
      console.log('Redis connected successfully.');
    } catch (cacheError) {
      console.warn('Redis connection failed, running without cache:', cacheError.message);
    }

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`
        API Gateway is Running
          Port: ${PORT}
          Environment: ${process.env.NODE_ENV || 'development'}
          Redis Cache: ${cacheService.isConnected ? 'Enabled' : 'Disabled'}
          Swagger UI: http://localhost:${PORT}/api-docs
          Health Check: http://localhost:${PORT}/health
          Cache Stats: http://localhost:${PORT}/cache/stats
              `);
    });

    // Gestion graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down gracefully...');
      if (cacheService.isConnected) {
        await cacheService.disconnect();
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();