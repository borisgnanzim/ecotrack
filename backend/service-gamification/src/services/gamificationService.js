class GamificationService {
  static async getUserPoints(userId) {
    return {
      userId,
      points: 120,
      level: 4,
      badges: ['first-login', 'green-hero'],
    };
  }

  static async awardReward(userId, reward) {
    if (!reward || typeof reward !== 'string') {
      throw new Error('Reward must be a valid string');
    }

    return {
      userId,
      reward,
      status: 'awarded',
      awardedAt: new Date().toISOString(),
    };
  }
}

module.exports = GamificationService;
