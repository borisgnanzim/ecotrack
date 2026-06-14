const ChallengeService = require('../src/services/challengeService'); // Assuming a ChallengeService exists
const { PrismaClient } = require('@prisma/client');
const GamificationPublisher = require('../kafka/gamificationPublisher');
const PointsService = require('../src/services/pointsService');

jest.mock('@prisma/client', () => {
  const mPrisma = {
    challenge: {
      create: jest.fn(),
    },
    challengeParticipation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

jest.mock('../kafka/gamificationPublisher', () => ({
  publishGamificationEvent: jest.fn(),
}));
jest.mock('../src/services/pointsService');

describe('ChallengeService', () => {
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    // Reset mocks before each test
    mockPrisma.challenge.create.mockClear();
    mockPrisma.challengeParticipation.create.mockClear();
    mockPrisma.challengeParticipation.findUnique.mockClear();
    mockPrisma.challengeParticipation.update.mockClear();
    GamificationPublisher.publishGamificationEvent.mockClear();
  });

  describe('Challenge Management', () => {
    test('should create a new challenge', async () => {
      const challengeData = {
        title: 'Test Challenge',
        description: 'Complete this challenge',
        pointsReward: 100,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000), // 1 day later
      };

      mockPrisma.challenge.create.mockResolvedValue({
        id: 'challenge-1',
        ...challengeData,
        createdAt: new Date(),
      });

      // Assuming ChallengeService has a createChallenge method
      const result = await ChallengeService.createChallenge(challengeData);

      expect(mockPrisma.challenge.create).toHaveBeenCalledWith({
        data: challengeData,
      });
      expect(result).toMatchObject({ id: 'challenge-1', ...challengeData });
    });

    test('should allow user to join a challenge', async () => {
      const userId = 'test-user-123';
      const challengeId = 'challenge-1';

      mockPrisma.challengeParticipation.create.mockResolvedValue({
        id: 'participation-1',
        userId,
        challengeId,
        progress: 0,
        status: 'in_progress',
        joinedAt: new Date(),
      });

      // Assuming ChallengeService has a joinChallenge method
      const result = await ChallengeService.joinChallenge(userId, challengeId);

      expect(mockPrisma.challengeParticipation.create).toHaveBeenCalledWith({
        data: {
          userId,
          challengeId,
          progress: 0,
          status: 'in_progress',
        },
      });
      expect(result).toMatchObject({ id: 'participation-1', userId, challengeId });
    });

    test('should update challenge progress', async () => {
      const userId = 'test-user-123';
      const challengeId = 'challenge-1';
      const newProgress = 6;

      mockPrisma.challengeParticipation.findUnique.mockResolvedValue({
        id: 'participation-1',
        userId,
        challengeId,
        progress: 5,
        status: 'in_progress',
        challenge: { objective: 10, reward: 100 },
      });

      mockPrisma.challengeParticipation.update.mockResolvedValue({
        id: 'participation-1',
        userId,
        challengeId,
        progress: newProgress,
        status: 'in_progress',
      });

      // Assuming ChallengeService has an updateChallengeProgress method
      const result = await ChallengeService.updateChallengeProgress(userId, challengeId, newProgress);

      expect(mockPrisma.challengeParticipation.findUnique).toHaveBeenCalledWith({
        where: { userId_challengeId: { userId, challengeId } },
        include: { challenge: true },
      });
      expect(mockPrisma.challengeParticipation.update).toHaveBeenCalledWith({
        where: { userId_challengeId: { userId, challengeId } },
        data: { progress: newProgress },
      });
      expect(result).toMatchObject({ progress: newProgress });
    });

    test('should award points when challenge is completed', async () => {
      const userId = 'test-user-123';
      const challengeId = 'challenge-1';
      const rewardPoints = 100;

      mockPrisma.challengeParticipation.findUnique.mockResolvedValue({
        id: 'participation-1',
        userId,
        challengeId,
        progress: 9,
        status: 'in_progress',
        challenge: { objective: 10, reward: rewardPoints },
      });

      mockPrisma.challengeParticipation.update.mockResolvedValue({
        id: 'participation-1',
        userId,
        challengeId,
        progress: 10,
        status: 'completed',
      });

      PointsService.addPoints.mockResolvedValue(true);

      // Assuming ChallengeService has an updateChallengeProgress method
      await ChallengeService.updateChallengeProgress(userId, challengeId, 10);

      expect(PointsService.addPoints).toHaveBeenCalledWith(userId, 'challenge_completed', rewardPoints);
      expect(GamificationPublisher.publishGamificationEvent).toHaveBeenCalledWith('challenge_completed', { userId, challengeId, reward: rewardPoints });
    });
  });
});