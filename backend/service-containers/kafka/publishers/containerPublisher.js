// kafka/publishers/containerPublisher.js - Producteur d'événements conteneurs (ES6 modules)
import { publishMessage } from '../kafkaClient.js';
import { KAFKA_TOPICS } from '../topics.js';

export class ContainerPublisher {
  /**
   * Publier un événement de création de conteneur
   */
  static async publishContainerCreated(container) {
    return publishMessage(KAFKA_TOPICS.CONTAINER_CREATED, {
      containerId: container.id,
      type: container.type,
      location: container.location,
      capacity: container.capacity,
      status: container.status,
      createdAt: container.createdAt,
    }, `container-${container.id}`);
  }

  /**
   * Publier un événement de mise à jour de conteneur
   */
  static async publishContainerUpdated(container) {
    return publishMessage(KAFKA_TOPICS.CONTAINER_UPDATED, {
      containerId: container.id,
      changes: container.changes,
      updatedAt: new Date(),
    }, `container-${container.id}`);
  }

  /**
   * Publier un événement de changement de statut
   */
  static async publishContainerStatusChanged(containerId, oldStatus, newStatus) {
    return publishMessage(KAFKA_TOPICS.CONTAINER_STATUS_CHANGED, {
      containerId,
      oldStatus,
      newStatus,
      changedAt: new Date(),
    }, `container-${containerId}`);
  }

  /**
   * Publier un événement de niveau de remplissage
   */
  static async publishContainerFillLevel(containerId, fillLevel, totalCapacity) {
    return publishMessage(KAFKA_TOPICS.CONTAINER_FILL_LEVEL, {
      containerId,
      fillLevel,
      fillPercentage: (fillLevel / totalCapacity) * 100,
      totalCapacity,
      timestamp: new Date(),
      requiresCollection: fillLevel / totalCapacity > 0.8,
    }, `container-${containerId}`);
  }

  /**
   * Publier un événement de suppression
   */
  static async publishContainerDeleted(containerId) {
    return publishMessage(KAFKA_TOPICS.CONTAINER_DELETED, {
      containerId,
      deletedAt: new Date(),
    }, `container-${containerId}`);
  }
}
