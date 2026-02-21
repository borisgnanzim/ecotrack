// src/services/cache.service.js
/**
 * Service de cache Redis
 * Gère la mise en cache des données pour réduire la charge DB
 */

const redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 heure par défaut
  }

  /**
   * Initialiser la connexion Redis
   */
  async connect() {
    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('Redis connection refused - Cache disabled');
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      // Événements
      this.client.on('error', (err) => {
        console.error('Redis Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis Ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        console.log('⚠️  Redis Disconnected');
        this.isConnected = false;
      });

      // Pour redis v4+, on utilise connect() explicitement
      await this.client.connect();
      return this;
    } catch (error) {
      console.error('Erreur connexion Redis:', error);
      this.isConnected = false;
      return this;
    }
  }

  /**
   * Obtenir une valeur du cache
   * @param {string} key - Clé du cache
   * @returns {Promise<any>} Valeur ou null
   */
  async get(key) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const data = await this.client.get(key);
      if (data) {
        console.log(`✓ Cache HIT: ${key}`);
        return JSON.parse(data);
      }
      console.log(`✗ Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error('Erreur cache GET:', error);
      return null;
    }
  }

  /**
   * Stocker une valeur dans le cache
   * @param {string} key - Clé du cache
   * @param {any} value - Valeur à stocker
   * @param {number} ttl - Temps de vie en secondes (optionnel)
   */
  async set(key, value, ttl = null) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const expirationTime = ttl || this.defaultTTL;
      await this.client.setEx(
        key,
        expirationTime,
        JSON.stringify(value)
      );
      console.log(`✓ Cache SET: ${key} (TTL: ${expirationTime}s)`);
      return true;
    } catch (error) {
      console.error('Erreur cache SET:', error);
      return false;
    }
  }

  /**
   * Supprimer une clé du cache
   * @param {string} key - Clé à supprimer
   */
  async delete(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      console.log(`✓ Cache DELETE: ${key}`);
      return true;
    } catch (error) {
      console.error('Erreur cache DELETE:', error);
      return false;
    }
  }

  /**
   * Supprimer plusieurs clés du cache (par pattern)
   * @param {string} pattern - Pattern (ex: "containers:*")
   */
  async deletePattern(pattern) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`✓ Cache DELETE PATTERN: ${pattern} (${keys.length} clés)`);
      }
      return true;
    } catch (error) {
      console.error('Erreur cache DELETE PATTERN:', error);
      return false;
    }
  }

  /**
   * Vider tout le cache
   */
  async clear() {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.flushDb();
      console.log('✓ Cache CLEARED');
      return true;
    } catch (error) {
      console.error('Erreur cache CLEAR:', error);
      return false;
    }
  }

  /**
   * Vérifier si une clé existe
   * @param {string} key - Clé à vérifier
   */
  async exists(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Erreur cache EXISTS:', error);
      return false;
    }
  }

  /**
   * Obtenir les stats du cache
   */
  async getStats() {
    if (!this.isConnected || !this.client) {
      return { status: 'disconnected' };
    }

    try {
      const info = await this.client.info('stats');
      const dbSize = await this.client.dbSize();

      return {
        status: 'connected',
        keys: dbSize,
        info: info
      };
    } catch (error) {
      console.error('Erreur stats cache:', error);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Fermer la connexion Redis
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      console.log('Redis Disconnected');
    }
  }

  /**
   * Générer une clé de cache formatée
   * @param {string} prefix - Préfixe (ex: "containers")
   * @param {string} id - ID (optionnel)
   */
  generateKey(prefix, id = null) {
    return id ? `${prefix}:${id}` : `${prefix}:*`;
  }
}

// Singleton
module.exports = new CacheService();
