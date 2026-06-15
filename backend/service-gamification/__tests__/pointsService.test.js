const PointsService = require('../src/services/pointsService');
const { PrismaClient } = require('@prisma/client');
const GamificationPublisher = require('../kafka/gamificationPublisher');

// Define mocks using 'var' or ensure they are available before the hoisted jest.mock call
var mockUserActionCreate = jest.fn();
var mockUserActionAggregate = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      userAction: { 
        create: mockUserActionCreate, 
        aggregate: mockUserActionAggregate },
    })),
  };
});

jest.mock('../kafka/gamificationPublisher', () => ({
  publishGamificationEvent: jest.fn(),
}));

describe('PointsService', () => {
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    // Reset mocks before each test
    mockUserActionCreate.mockClear();
    mockUserActionAggregate.mockClear();
    GamificationPublisher.publishGamificationEvent.mockClear();
  });

  describe('Points Management', () => {
    test('should add points for an action', async () => {
      const userId = 'test-user-123';
      const action = 'report';
      const points = 10;

      mockUserActionCreate.mockResolvedValue({
        id: '1',
        userId,
        action,
        points,
        timestamp: new Date(),
      });

      // Assuming PointsService has an addPoints method
      await PointsService.addPoints(userId, action, points);

      expect(mockUserActionCreate).toHaveBeenCalledWith({
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

      mockUserActionAggregate.mockResolvedValue({
        _sum: { points: totalPoints },
      });

      // Assuming PointsService has a getUserTotalPoints method
      const result = await PointsService.getUserTotalPoints(userId);

      expect(mockUserActionAggregate).toHaveBeenCalledWith({
        where: { userId },
        _sum: { points: true },
      });
      expect(result).toBe(totalPoints);
    });
  });
});