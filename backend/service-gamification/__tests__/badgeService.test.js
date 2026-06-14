const BadgeService = require('../src/services/badgeService'); // Assuming a BadgeService exists
const { PrismaClient } = require('@prisma/client');
const GamificationPublisher = require('../kafka/gamificationPublisher');

jest.mock('@prisma/client', () => {
  const mPrisma = {
    userBadge: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    badge: {
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

jest.mock('../kafka/gamificationPublisher', () => ({
  publishGamificationEvent: jest.fn(),
}));

describe('BadgeService', () => {
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    // Reset mocks before each test
    mockPrisma.userBadge.create.mockClear();
    mockPrisma.badge.findUnique.mockClear();
    mockPrisma.userBadge.findMany.mockClear();
    GamificationPublisher.publishGamificationEvent.mockClear();
  });

  describe('Badge Management', () => {
    test('should award badge when points threshold is met', async () => {
      const userId = 'test-user-123';
      const badgeId = 'badge-1';
      const badgeName = 'Eco Warrior';

      mockPrisma.userBadge.create.mockResolvedValue({
        id: '1',
        userId,
        badgeId,
        awardedAt: new Date(),
      });
      mockPrisma.badge.findUnique.mockResolvedValue({
        id: badgeId,
        name: badgeName,
        description: 'Awarded for being an eco warrior',
      });

      // Assuming BadgeService has an awardBadge method
      await BadgeService.awardBadge(userId, badgeId);

      expect(mockPrisma.userBadge.create).toHaveBeenCalledWith({
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

      mockPrisma.userBadge.create.mockRejectedValue({
        code: 'P2002', // Prisma unique constraint violation error code
      });

      // Assuming BadgeService has an awardBadge method
      await expect(BadgeService.awardBadge(userId, badgeId)).rejects.toThrow(
        'Badge already awarded to this user.'
      );
      expect(GamificationPublisher.publishGamificationEvent).not.toHaveBeenCalled();
    });

    test('should get user badges', async () => {
      const userId = 'test-user-123';
      const badges = [{ id: 'badge-1', name: 'Eco Warrior' }];

      mockPrisma.userBadge.findMany.mockResolvedValue(badges);

      const result = await BadgeService.getUserBadges(userId);

      expect(mockPrisma.userBadge.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { badge: true },
      });
      expect(result).toEqual(badges);
    });
  });
});