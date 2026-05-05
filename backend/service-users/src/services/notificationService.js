const Notification = require('../models/Notification');
const User = require('../models/User');
const ValidationError = require('../dto/ValidationError');

const MODE = process.env.NOTIFICATION_MODE || 'local'; // 'local' or 'http'
const HTTP_ENDPOINT = process.env.NOTIFICATION_SERVICE_URL || null;

async function publishToHttp(data) {
  if (!HTTP_ENDPOINT) throw new Error('NOTIFICATION_SERVICE_URL not configured');
  // node >=18 has global fetch
  const res = await fetch(`${HTTP_ENDPOINT.replace(/\/+$/, '')}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP publish failed: ${res.status} ${text}`);
  }
  return res.json();
}

class NotificationService {
  /**
   * Envoyer une notification de bienvenue
   * @param {object} user
   */
  async sendWelcomeNotification(user) {
    const payload = {
      userId: user.id,
      title: 'Bienvenue',
      message: `Bienvenue sur Ecotrack, ${user.name || user.username}!`,
      type: 'info',
    };

    if (MODE === 'http') {
      return publishToHttp(payload);
    }

    return Notification.create(payload);
  }

  /**
   * Publier une notification générique
   * @param {object} data
   */
  async publishNotification(data) {
    if (MODE === 'http') return publishToHttp(data);
    return Notification.create(data);
  }

  /**
   * Récupérer toutes les notifications d'un utilisateur
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getNotifications(userId) {
    return await Notification.find({ userId });
  }
  /** 
   * Récupérer toutes les notifications d'un utilisateur avec pagination
   * @param {object} options - { page, limit }
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getNotificationsWithPagination(userId, options) {
    return await Notification.findByUserIdPaginated(userId, options);
  }

  /**
   * Créer une notification
   * @param {object} notificationData - {userId, title, message, type, isRead}
   * @returns {Promise<object>}
   */
  async createNotification(notificationData) {
    return await Notification.create(notificationData);
  }

  /**
   * Marquer une notification comme lue
   * @param {string} notificationId
   * @param {string} userId - Pour vérifier la permission
   * @returns {Promise<object>}
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      const error = new ValidationError({ id: 'Notification non trouvée' });
      error.statusCode = 404;
      throw error;
    }

    if (userId && notification.userId !== userId) {
      const error = new ValidationError({ permission: 'Accès refusé' });
      error.statusCode = 403;
      throw error;
    }

    return await Notification.update(notificationId, { isRead: true });
  }

  /**
   * Supprimer une notification
   * @param {string} notificationId
   * @param {string} userId - Pour vérifier la permission
   * @returns {Promise<object>}
   */
  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      const error = new ValidationError({ id: 'Notification non trouvée' });
      error.statusCode = 404;
      throw error;
    }

    if (userId && notification.userId !== userId) {
      const error = new ValidationError({ permission: 'Accès refusé' });
      error.statusCode = 403;
      throw error;
    }

    await Notification.delete(notificationId);
    return { message: 'Notification supprimée avec succès' };
  }
}

module.exports = new NotificationService();
