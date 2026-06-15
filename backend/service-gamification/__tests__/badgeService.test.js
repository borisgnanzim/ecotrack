const BadgeService = require('../src/services/badgeService'); // Assuming a BadgeService exists
const { PrismaClient } = require('@prisma/client');
const GamificationPublisher = require('../kafka/gamificationPublisher');

var mockUserBadgeCreate = jest.fn();
var mockUserBadgeFindMany = jest.fn();
var mockBadgeFindUnique = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      userBadge: { 
        create: mockUserBadgeCreate, 
        findMany: mockUserBadgeFindMany, findUnique: mockBadgeFindUnique }, // Added findUnique here
      badge: { findUnique: mockBadgeFindUnique },
    })),
  };
});

jest.mock('../kafka/gamificationPublisher', () => ({
  publishGamificationEvent: jest.fn(),
}));

describe('BadgeService', () => {
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    // Reset mocks before each test
    mockUserBadgeCreate.mockClear();
    mockBadgeFindUnique.mockClear();
    mockUserBadgeFindMany.mockClear();
    GamificationPublisher.publishGamificationEvent.mockClear();
  });

  describe('Badge Management', () => {
    test('should award badge when points threshold is met', async () => {
      const userId = 'test-user-123';
      const badgeId = 'badge-1';
      const badgeName = 'Eco Warrior';

      mockUserBadgeCreate.mockResolvedValue({
        id: '1',
        userId,
        badgeId,
        awardedAt: new Date(),
      });
      mockBadgeFindUnique.mockResolvedValue({
        id: badgeId,
        name: badgeName,
        description: 'Awarded for being an eco warrior',
      });

      // Assuming BadgeService has an awardBadge method
      await BadgeService.awardBadge(userId, badgeId);

      expect(mockUserBadgeCreate).toHaveBeenCalledWith({
        data: {
          userId,
          badgeId,
        },
      });
      expect(GamificationPublisher.publishGamificationEvent).toHaveBeenCalledWith('badge_awarded', { userId, badgeId, badgeName });
    });

    test('should not award duplicate badges', async () => {
      const userId = 'test-user-123';
      const badgeId = 'badge-1';

      mockUserBadgeCreate.mockRejectedValue({
        code: 'P2002', // Prisma unique constraint violation error code
      });

      // Assuming BadgeService has an awardBadge method
      await expect(BadgeService.awardBadge(userId, badgeId)).rejects.toThrow(
        'Badge already awarded to this user.'
      );
      expect(GamificationPublisher.publishGamificationEvent).not.toHaveBeenCalled(); // This line was already correct
    });

    test('should get user badges', async () => {
      const userId = 'test-user-123';
      const badges = [{ id: 'badge-1', name: 'Eco Warrior' }];

      mockUserBadgeFindMany.mockResolvedValue(badges);

      const result = await BadgeService.getUserBadges(userId);

      expect(mockUserBadgeFindMany).toHaveBeenCalledWith({
        where: { userId },
        include: { badge: true },
      });
      expect(result).toEqual(badges);
    });
  });
});