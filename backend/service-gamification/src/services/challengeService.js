/**
 * Service de gestion des défis
 */
const { prisma } = require('../config/postgres');
const PointsService = require('./pointsService');

class ChallengeService {
  static async createChallenge(data) {
    return prisma.challenge.create({ data });
  }

  static async getActiveChallenges() {
    return prisma.challenge.findMany({
      where: { isActive: true },
    });
  }

  static async joinChallenge(userId, challengeId) {
    const existingParticipation = await prisma.userChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
    });

    if (existingParticipation) {
      return existingParticipation; // Already joined
    }

    return prisma.userChallenge.create({
      data: {
        userId,
        challengeId,
      },
    });
  }

  static async updateChallengeProgress(userId, challengeId, progressIncrement) {
    const userChallenge = await prisma.userChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
      include: { challenge: true },
    });

    if (!userChallenge || userChallenge.isCompleted) {
      return null; // Challenge not found or already completed
    }

    const newProgress = userChallenge.currentProgress + progressIncrement;
    const isCompleted = newProgress >= userChallenge.challenge.targetValue;

    const updatedUserChallenge = await prisma.userChallenge.update({
      where: { id: userChallenge.id },
      data: {
        currentProgress: newProgress,
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      include: { challenge: true },
    });

    if (isCompleted) {
      // Award points for completing the challenge
      await PointsService.addPoints(userId, `challenge_completed_${challengeId}`, updatedUserChallenge.challenge.rewardPoints);
      // TODO: Publish Kafka event for challenge completion
    }

    return updatedUserChallenge;
  }

  static async getUserChallenges(userId) {
    return prisma.userChallenge.findMany({
      where: { userId },
      include: { challenge: true },
    });
  }
}

module.exports = ChallengeService;