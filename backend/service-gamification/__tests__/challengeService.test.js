const ChallengeService = require('../src/services/challengeService');

jest.mock('../src/config/postgres', () => ({
  prisma: {
    challenge: { create: jest.fn() },
    userChallenge: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../src/services/pointsService', () => ({
  addPoints: jest.fn().mockResolvedValue(undefined),
}));

const { prisma } = require('../src/config/postgres');
const PointsService = require('../src/services/pointsService');

describe('ChallengeService', () => {
  beforeEach(() => {
    prisma.challenge.create.mockClear();
    prisma.userChallenge.findUnique.mockClear();
    prisma.userChallenge.create.mockClear();
    prisma.userChallenge.update.mockClear();
    PointsService.addPoints.mockClear();
  });

  describe('Challenge Management', () => {
    test('should create a new challenge', async () => {
      const challengeData = {
        title: 'Test Challenge',
        description: 'Complete this challenge',
        rewardPoints: 100,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      };
      prisma.challenge.create.mockResolvedValue({ id: 'challenge-1', ...challengeData });

      const result = await ChallengeService.createChallenge(challengeData);

      expect(prisma.challenge.create).toHaveBeenCalledWith({ data: challengeData });
      expect(result).toMatchObject({ id: 'challenge-1', ...challengeData });
    });

    test('should allow user to join a challenge', async () => {
      const userId = 'test-user-123';
      const challengeId = 'challenge-1';

      prisma.userChallenge.findUnique.mockResolvedValue(null);
      prisma.userChallenge.create.mockResolvedValue({
        id: 'participation-1',
        userId,
        challengeId,
        currentProgress: 0,
        isCompleted: false,
      });

      const result = await ChallengeService.joinChallenge(userId, challengeId);

      expect(prisma.userChallenge.findUnique).toHaveBeenCalledWith({
        where: { userId_challengeId: { userId, challengeId } },
      });
      expect(prisma.userChallenge.create).toHaveBeenCalledWith({
        data: { userId, challengeId },
      });
      expect(result).toMatchObject({ id: 'participation-1', userId, challengeId });
    });

    test('should return existing participation when already joined', async () => {
      const userId = 'test-user-123';
      const challengeId = 'challenge-1';
      const existing = { id: 'participation-1', userId, challengeId, currentProgress: 2 };

      prisma.userChallenge.findUnique.mockResolvedValue(existing);

      const result = await ChallengeService.joinChallenge(userId, challengeId);

      expect(prisma.userChallenge.create).not.toHaveBeenCalled();
      expect(result).toEqual(existing);
    });

    test('should update challenge progress', async () => {
      const userId = 'test-user-123';
      const challengeId = 'challenge-1';

      prisma.userChallenge.findUnique.mockResolvedValue({
        id: 'participation-1',
        userId,
        challengeId,
        currentProgress: 5,
        isCompleted: false,
        challenge: { targetValue: 10, rewardPoints: 100 },
      });
      prisma.userChallenge.update.mockResolvedValue({
        id: 'participation-1',
        currentProgress: 6,
        isCompleted: false,
        challenge: { rewardPoints: 100 },
      });

      const result = await ChallengeService.updateChallengeProgress(userId, challengeId, 1);

      expect(prisma.userChallenge.findUnique).toHaveBeenCalledWith({
        where: { userId_challengeId: { userId, challengeId } },
        include: { challenge: true },
      });
      expect(prisma.userChallenge.update).toHaveBeenCalledWith({
        where: { id: 'participation-1' },
        data: { currentProgress: 6, isCompleted: false, completedAt: null },
        include: { challenge: true },
      });
      expect(result).toMatchObject({ currentProgress: 6 });
    });

    test('should award points when challenge is completed', async () => {
      const userId = 'test-user-123';
      const challengeId = 'challenge-1';
      const rewardPoints = 100;

      prisma.userChallenge.findUnique.mockResolvedValue({
        id: 'participation-1',
        userId,
        challengeId,
        currentProgress: 9,
        isCompleted: false,
        challenge: { targetValue: 10, rewardPoints },
      });
      prisma.userChallenge.update.mockResolvedValue({
        id: 'participation-1',
        currentProgress: 10,
        isCompleted: true,
        challenge: { rewardPoints },
      });

      await ChallengeService.updateChallengeProgress(userId, challengeId, 1);

      expect(PointsService.addPoints).toHaveBeenCalledWith(
        userId,
        `challenge_completed_${challengeId}`,
        rewardPoints
      );
    });
  });
});
