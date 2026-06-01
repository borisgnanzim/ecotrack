const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Point values for different actions
const POINTS_CONFIG = {
  report: 10,
  challenge_completed: 50,
  badge_earned: 5,
};

// Badge thresholds
const BADGES = {
  beginner: { name: 'Débutner', pointsRequired: 100, description: 'Premier pas en éco-engagement' },
  ecoWarrior: { name: 'Éco-Warrior', pointsRequired: 500, description: 'Guerrier écologique confirmé' },
  superHero: { name: 'Super-Héros', pointsRequired: 1000, description: 'Héros écologique suprême' },
};

class GamificationService {
  // ===== POINTS MANAGEMENT =====
  static async addPoints(userId, action, points = null) {
    const pointsValue = points || POINTS_CONFIG[action] || 0;

    // Record the action
    const userAction = await prisma.userAction.create({
      data: {
        userId,
        action,
        points: pointsValue,
      },
    });

    // Get total points for the user
    const totalPoints = await this.getUserTotalPoints(userId);

    // Check if user earned new badges
    await this.checkAndAwardBadges(userId, totalPoints);

    return userAction;
  }

  static async getUserTotalPoints(userId) {
    const result = await prisma.userAction.aggregate({
      where: { userId },
      _sum: { points: true },
    });
    return result._sum?.points || 0;
  }

  // ===== BADGE MANAGEMENT =====
  static async checkAndAwardBadges(userId, totalPoints) {
    const badgeEntries = Object.entries(BADGES);

    for (const [key, badgeData] of badgeEntries) {
      // Check if user already has this badge
      const existingBadge = await prisma.badge.findUnique({
        where: { name: badgeData.name },
      });

      if (!existingBadge) {
        // Create badge if doesn't exist
        const newBadge = await prisma.badge.create({
          data: {
            name: badgeData.name,
            description: badgeData.description,
            pointsRequired: badgeData.pointsRequired,
          },
        });

        // Award if user has enough points
        if (totalPoints >= badgeData.pointsRequired) {
          await this.awardBadge(userId, newBadge.id);
        }
      } else {
        // Check if user has already been awarded
        const alreadyAwarded = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId,
              badgeId: existingBadge.id,
            },
          },
        });

        if (!alreadyAwarded && totalPoints >= badgeData.pointsRequired) {
          await this.awardBadge(userId, existingBadge.id);
        }
      }
    }
  }

  static async awardBadge(userId, badgeId) {
    try {
      const userBadge = await prisma.userBadge.create({
        data: {
          userId,
          badgeId,
        },
        include: { badge: true },
      });

      // Award points for getting a badge
      await this.addPoints(userId, 'badge_earned', POINTS_CONFIG.badge_earned);

      return userBadge;
    } catch (error) {
      // Badge already awarded, ignore
      if (error.code === 'P2002') {
        return null;
      }
      throw error;
    }
  }

  static async getUserBadges(userId) {
    return await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    });
  }

  // ===== CHALLENGE MANAGEMENT =====
  static async createChallenge(data) {
    return await prisma.challenge.create({
      data: {
        title: data.title,
        description: data.description,
        objective: data.objective,
        reward: data.reward,
        type: data.type || 'individual',
        period: data.period || 'weekly',
        endDate: data.endDate,
      },
    });
  }

  static async getActiveChallenges() {
    return await prisma.challenge.findMany({
      where: {
        endDate: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async joinChallenge(userId, challengeId) {
    try {
      return await prisma.challengeParticipation.create({
        data: {
          userId,
          challengeId,
        },
        include: { challenge: true },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        // Already joined, return existing
        return await prisma.challengeParticipation.findUnique({
          where: {
            userId_challengeId: { userId, challengeId },
          },
          include: { challenge: true },
        });
      }
      throw error;
    }
  }

  static async updateChallengeProgress(userId, challengeId, progressIncrement) {
    const participation = await prisma.challengeParticipation.findUnique({
      where: {
        userId_challengeId: { userId, challengeId },
      },
      include: { challenge: true },
    });

    if (!participation) {
      throw new Error('User not participating in this challenge');
    }

    const newProgress = participation.progress + progressIncrement;
    const isCompleted = newProgress >= participation.challenge.objective;

    const updated = await prisma.challengeParticipation.update({
      where: { id: participation.id },
      data: {
        progress: newProgress,
        status: isCompleted ? 'completed' : 'in_progress',
        completedAt: isCompleted ? new Date() : null,
      },
      include: { challenge: true },
    });

    // Award points if completed
    if (isCompleted) {
      await this.addPoints(userId, 'challenge_completed', participation.challenge.reward);
    }

    return updated;
  }

  static async getUserChallenges(userId) {
    return await prisma.challengeParticipation.findMany({
      where: { userId },
      include: { challenge: true },
      orderBy: { joinedAt: 'desc' },
    });
  }

  // ===== LEADERBOARD =====
  static async getLeaderboard(limit = 50) {
    const leaderboard = await prisma.userAction.groupBy({
      by: ['userId'],
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: limit,
    });

    // Enhance with user badges and format
    const enhanced = await Promise.all(
      leaderboard.map(async (entry, index) => {
        const badges = await this.getUserBadges(entry.userId);
        return {
          rank: index + 1,
          userId: entry.userId,
          totalPoints: entry._sum.points || 0,
          badgeCount: badges.length,
          badges: badges.map(ub => ub.badge.name),
        };
      })
    );

    return enhanced;
  }

  // ===== STATISTICS =====
  static async getUserStats(userId) {
    const totalPoints = await this.getUserTotalPoints(userId);
    const badges = await this.getUserBadges(userId);
    const actions = await prisma.userAction.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    // Points by period
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyResult = await prisma.userAction.aggregate({
      where: {
        userId,
        timestamp: { gte: oneWeekAgo },
      },
      _sum: { points: true },
    });

    const monthlyResult = await prisma.userAction.aggregate({
      where: {
        userId,
        timestamp: { gte: oneMonthAgo },
      },
      _sum: { points: true },
    });

    // Get leaderboard for comparison
    const leaderboard = await this.getLeaderboard(1000);
    const userRank = leaderboard.findIndex(u => u.userId === userId) + 1;
    const averagePoints =
      leaderboard.reduce((sum, u) => sum + u.totalPoints, 0) / leaderboard.length;

    return {
      userId,
      totalPoints,
      weeklyPoints: weeklyResult._sum?.points || 0,
      monthlyPoints: monthlyResult._sum?.points || 0,
      badgeCount: badges.length,
      badges: badges.map(ub => ({ name: ub.badge.name, awardedAt: ub.awardedAt })),
      rank: userRank,
      averagePoints: Math.round(averagePoints),
      recentActions: actions.slice(0, 10),
      co2Saved: Math.round(totalPoints * 0.5), // Example: 0.5 kg CO2 per point
    };
  }

  // ===== REWARDS =====
  static async awardReward(userId, reward) {
    if (!reward || typeof reward !== 'string') {
      throw new Error('Reward must be a valid string');
    }

    // Example implementation - log the reward and add points
    await this.addPoints(userId, `reward_${reward}`, 25);

    return {
      userId,
      reward,
      status: 'awarded',
      awardedAt: new Date().toISOString(),
    };
  }
}

module.exports = GamificationService;
