// kafka/topics.js - Topics Kafka pour service-users

const KAFKA_TOPICS = {
  // Événements Conteneurs
  CONTAINER_CREATED: 'container-created',
  CONTAINER_UPDATED: 'container-updated',
  CONTAINER_DELETED: 'container-deleted',
  CONTAINER_STATUS_CHANGED: 'container-status-changed',
  CONTAINER_FILL_LEVEL: 'container-fill-level',
  
  // Événements Utilisateurs
  USER_CREATED: 'user-created',
  USER_UPDATED: 'user-updated',
  USER_ROLE_CHANGED: 'user-role-changed',
  USER_DELETED: 'user-deleted',
  
  // Événements Routes
  ROUTE_CREATED: 'route-created',
  ROUTE_UPDATED: 'route-updated',
  ROUTE_DELETED: 'route-deleted',
  ROUTE_COMPLETED: 'route-completed',
  
  // Events globaux
  SYSTEM_EVENT: 'system-event',
};

// Groupes de consommateurs par service
const KAFKA_GROUPS = {
  ANALYTICS: 'analytics-group',
  ROUTES_SERVICE: 'routes-service-group',
  CONTAINERS_SERVICE: 'containers-service-group',
  USERS_SERVICE: 'users-service-group',
  API_GATEWAY: 'api-gateway-group',
};

// Topics publiés par ce service
const PUBLISHED_TOPICS = [
  KAFKA_TOPICS.USER_CREATED,
  KAFKA_TOPICS.USER_UPDATED,
  KAFKA_TOPICS.USER_ROLE_CHANGED,
  KAFKA_TOPICS.USER_DELETED,
];

module.exports = {
  KAFKA_TOPICS,
  KAFKA_GROUPS,
  PUBLISHED_TOPICS,
};
