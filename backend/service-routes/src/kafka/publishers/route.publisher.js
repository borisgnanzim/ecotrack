const { publishMessage } = require('../kafkaClient');
const { KAFKA_TOPICS } = require('../topics');

class RoutePublisher {
  static publishRouteCreated(route) {
    return publishMessage(KAFKA_TOPICS.ROUTE_CREATED, {
      routeId: route.id,
      agentId: route.agentId,
      containerIds: route.containerIds,
      date: route.date,
      status: route.status,
      createdAt: route.createdAt,
    }, `route-${route.id}`);
  }

  static publishRouteUpdated(payload) {
    return publishMessage(KAFKA_TOPICS.ROUTE_UPDATED, {
      routeId: payload.id,
      changes: payload.changes,
      updatedAt: payload.updatedAt ?? new Date(),
    }, `route-${payload.id}`);
  }

  static publishRouteCompleted(routeId, collectionsCount, totalDistance) {
    return publishMessage(KAFKA_TOPICS.ROUTE_COMPLETED, {
      routeId,
      collectionsCount,
      totalDistance,
      completedAt: new Date(),
    }, `route-${routeId}`);
  }

  static publishRouteDeleted(routeId) {
    return publishMessage(KAFKA_TOPICS.ROUTE_DELETED, {
      routeId,
      deletedAt: new Date(),
    }, `route-${routeId}`);
  }
}

module.exports = { RoutePublisher };
