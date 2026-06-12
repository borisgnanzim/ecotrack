const PointsService = require('../src/services/pointsService');
const { PrismaClient } = require('@prisma/client');
const GamificationPublisher = require('../kafka/gamificationPublisher');

jest.mock('@prisma/client');
jest.mock('../kafka/gamificationPublisher', () => ({
  publishGamificationEvent: jest.fn(),
}));

describe('PointsService', () => {
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    // Reset mocks before each test
    mockPrisma.userAction.create.mockClear();
    mockPrisma.userAction.aggregate.mockClear();
    GamificationPublisher.publishGamificationEvent.mockClear();
  });

  describe('Points Management', () => {
    test('should add points for an action', async () => {
      const userId = 'test-user-123';
      const action = 'report';
      const points = 10;

      mockPrisma.userAction.create.mockResolvedValue({
        id: '1',
        userId,
        action,
        points,
        timestamp: new Date(),
      });

      // Assuming PointsService has an addPoints method
      await PointsService.addPoints(userId, action, points);

      expect(mockPrisma.userAction.create).toHaveBeenCalledWith({
        data: {
          userId,
          actionType: action,
          points,
        },
      });
      expect(GamificationPublisher.publishGamificationEvent).toHaveBeenCalledWith('points_awarded', { userId, points, actionType: action });
    });

    test('should calculate total points correctly', async () => {
      const userId = 'test-user-123';
      const totalPoints = 150;

      mockPrisma.userAction.aggregate.mockResolvedValue({
        _sum: { points: totalPoints },
      });

      // Assuming PointsService has a getUserTotalPoints method
      const result = await PointsService.getUserTotalPoints(userId);

      expect(mockPrisma.userAction.aggregate).toHaveBeenCalledWith({
        where: { userId },
        _sum: { points: true },
      });
      expect(result).toBe(totalPoints);
    });
  });
});