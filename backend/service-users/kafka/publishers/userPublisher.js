// kafka/publishers/userPublisher.js - Producteur d'événements utilisateurs
const { publishMessage } = require('../kafkaClient.js');
const { KAFKA_TOPICS } = require('../topics.js');

class UserPublisher {
  /**
   * Publier un événement de création d'utilisateur
   */
  static async publishUserCreated(user) {
    return publishMessage(KAFKA_TOPICS.USER_CREATED, {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'citizen',
      createdAt: user.createdAt,
    }, `user-${user.id}`);
  }

  /**
   * Publier un événement de mise à jour d'utilisateur
   */
  static async publishUserUpdated(userId, updates) {
    return publishMessage(KAFKA_TOPICS.USER_UPDATED, {
      userId,
      updates,
      updatedAt: new Date(),
    }, `user-${userId}`);
  }

  /**
   * Publier un événement de changement de rôle
   */
  static async publishUserRoleChanged(userId, oldRole, newRole) {
    return publishMessage(KAFKA_TOPICS.USER_ROLE_CHANGED, {
      userId,
      oldRole,
      newRole,
      changedAt: new Date(),
    }, `user-${userId}`);
  }

  /**
   * Publier un événement de suppression d'utilisateur
   */
  static async publishUserDeleted(userId) {
    return publishMessage(KAFKA_TOPICS.USER_DELETED, {
      userId,
      deletedAt: new Date(),
    }, `user-${userId}`);
  }
}

module.exports = {
  UserPublisher,
};
