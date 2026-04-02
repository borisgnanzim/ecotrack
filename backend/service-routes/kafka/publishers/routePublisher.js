// kafka/publishers/routePublisher.js - Producteur d'événements routes
const { publishMessage } = require('../kafkaClient.js');
const { KAFKA_TOPICS } = require('../topics.js');

class RoutePublisher {
  /**
   * Publier un événement de création de route
   */
  static async publishRouteCreated(route) {
    return publishMessage(KAFKA_TOPICS.ROUTE_CREATED, {
      routeId: route.id,
      driverId: route.driverId,
      containers: route.containers,
      plannedDate: route.plannedDate,
      status: route.status,
      createdAt: route.createdAt,
    }, `route-${route.id}`);
  }

  /**
   * Publier un événement de mise à jour de route
   */
  static async publishRouteUpdated(route) {
    return publishMessage(KAFKA_TOPICS.ROUTE_UPDATED, {
      routeId: route.id,
      changes: route.changes,
      updatedAt: new Date(),
    }, `route-${route.id}`);
  }

  /**
   * Publier un événement de route complétée
   */
  static async publishRouteCompleted(routeId, collectionsCount, totalDistance) {
    return publishMessage(KAFKA_TOPICS.ROUTE_COMPLETED, {
      routeId,
      collectionsCount,
      totalDistance,
      completedAt: new Date(),
    }, `route-${routeId}`);
  }

  /**
   * Publier un événement de suppression de route
   */
  static async publishRouteDeleted(routeId) {
    return publishMessage(KAFKA_TOPICS.ROUTE_DELETED, {
      routeId,
      deletedAt: new Date(),
    }, `route-${routeId}`);
  }
}

module.exports = {
  RoutePublisher,
};
