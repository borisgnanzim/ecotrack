const { getProducer } = require('./kafkaClient');
const { KAFKA_TOPICS } = require('./topics');

class GamificationPublisher {
  static async publishPointsAwarded(userId, actionType, points, totalPoints) {
    const producer = await getProducer();
    await producer.send({
      topic: KAFKA_TOPICS.GAMIFICATION_POINTS_AWARDED,
      messages: [{ value: JSON.stringify({ userId, actionType, points, totalPoints, timestamp: new Date() }) }],
    });
  }

  static async publishBadgeEarned(userId, badgeId, badgeName) {
    const producer = await getProducer();
    await producer.send({
      topic: KAFKA_TOPICS.GAMIFICATION_BADGE_EARNED,
      messages: [{ value: JSON.stringify({ userId, badgeId, badgeName, timestamp: new Date() }) }],
    });
  }

  // Add more publishers for challenge completion, etc.
}

module.exports = GamificationPublisher;