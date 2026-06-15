const PointsService = require('../src/services/pointsService');
const GamificationPublisher = require('../kafka/gamificationPublisher');

jest.mock('../src/config/postgres', () => ({
  prisma: {
    userAction: {
      create: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

jest.mock('../kafka/gamificationPublisher', () => ({
  publishPointsAwarded: jest.fn(),
}));

jest.mock('../src/services/badgeService', () => ({
  checkAndAwardBadges: jest.fn().mockResolvedValue(undefined),
}));

const { prisma } = require('../src/config/postgres');

describe('PointsService', () => {
  beforeEach(() => {
    prisma.userAction.create.mockClear();
    prisma.userAction.aggregate.mockClear();
    GamificationPublisher.publishPointsAwarded.mockClear();
  });

  describe('Points Management', () => {
    test('should add points for an action', async () => {
      const userId = 'test-user-123';
      const action = 'report';
      const points = 10;
      const totalPoints = 10;

      prisma.userAction.create.mockResolvedValue({
        id: '1',
        userId,
        actionType: action,
        points,
        timestamp: new Date(),
      });
      prisma.userAction.aggregate.mockResolvedValue({ _sum: { points: totalPoints } });

      await PointsService.addPoints(userId, action, points);

      expect(prisma.userAction.create).toHaveBeenCalledWith({
        data: { userId, actionType: action, points },
      });
      expect(GamificationPublisher.publishPointsAwarded).toHaveBeenCalledWith(
        userId,
        action,
        points,
        totalPoints
      );
    });

    test('should calculate total points correctly', async () => {
      const userId = 'test-user-123';
      const totalPoints = 150;

      prisma.userAction.aggregate.mockResolvedValue({ _sum: { points: totalPoints } });

      const result = await PointsService.getUserTotalPoints(userId);

      expect(prisma.userAction.aggregate).toHaveBeenCalledWith({
        where: { userId },
        _sum: { points: true },
      });
      expect(result).toBe(totalPoints);
    });
  });
});
