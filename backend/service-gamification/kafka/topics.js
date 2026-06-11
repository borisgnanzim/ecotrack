const KAFKA_TOPICS = {
  USER_CREATED: 'user-events.user-created',
  USER_UPDATED: 'user-events.user-updated',
  USER_ROLE_CHANGED: 'user-events.user-role-changed',
  USER_DELETED: 'user-events.user-deleted',

  CONTAINER_CREATED: 'container-events.container-created',
  CONTAINER_UPDATED: 'container-events.container-updated',
  CONTAINER_DELETED: 'container-events.container-deleted',
  CONTAINER_STATUS_CHANGED: 'container-events.container-status-changed',
  CONTAINER_FILL_LEVEL_UPDATED: 'container-events.container-fill-level-updated',

  ROUTE_CREATED: 'route-events.route-created',
  ROUTE_UPDATED: 'route-events.route-updated',
  ROUTE_DELETED: 'route-events.route-deleted',
  ROUTE_COMPLETED: 'route-events.route-completed',

  IOT_MEASUREMENT_RECEIVED: 'iot-events.measurement-received',
  IOT_ALERT_TRIGGERED: 'iot-events.alert-triggered',
  IOT_SENSOR_STATUS_CHANGED: 'iot-events.sensor-status-changed',

  GAMIFICATION_POINTS_AWARDED: 'gamification-events.points-awarded',
  GAMIFICATION_BADGE_EARNED: 'gamification-events.badge-earned',
  GAMIFICATION_CHALLENGE_COMPLETED: 'gamification-events.challenge-completed',
};

module.exports = { KAFKA_TOPICS };