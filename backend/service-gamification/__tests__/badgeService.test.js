const BadgeService = require('../src/services/badgeService');
const GamificationPublisher = require('../kafka/gamificationPublisher');

jest.mock('../src/config/postgres', () => ({
  prisma: {
    userBadge: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    badge: { findMany: jest.fn() },
  },
}));

jest.mock('../kafka/gamificationPublisher', () => ({
  publishBadgeEarned: jest.fn(),
}));

const { prisma } = require('../src/config/postgres');

describe('BadgeService', () => {
  beforeEach(() => {
    prisma.userBadge.create.mockClear();
    prisma.userBadge.findUnique.mockClear();
    prisma.userBadge.findMany.mockClear();
    GamificationPublisher.publishBadgeEarned.mockClear();
  });

  describe('Badge Management', () => {
    test('should award badge when points threshold is met', async () => {
      const userId = 'test-user-123';
      const badgeId = 'badge-1';
      const badgeName = 'Eco Warrior';

      prisma.userBadge.findUnique.mockResolvedValue(null);
      prisma.userBadge.create.mockResolvedValue({
        id: '1',
        userId,
        badgeId,
        awardedAt: new Date(),
        badge: { name: badgeName },
      });

      await BadgeService.awardBadge(userId, badgeId);

      expect(prisma.userBadge.findUnique).toHaveBeenCalledWith({
        where: { userId_badgeId: { userId, badgeId } },
      });
      expect(prisma.userBadge.create).toHaveBeenCalledWith({
        data: { userId, badgeId },
        include: { badge: true },
      });
      expect(GamificationPublisher.publishBadgeEarned).toHaveBeenCalledWith(userId, badgeId, badgeName);
    });

    test('should not award duplicate badges', async () => {
      const userId = 'test-user-123';
      const badgeId = 'badge-1';

      prisma.userBadge.findUnique.mockResolvedValue({ id: '1', userId, badgeId });

      await expect(BadgeService.awardBadge(userId, badgeId)).rejects.toThrow(
        'Badge already awarded to this user.'
      );
      expect(prisma.userBadge.create).not.toHaveBeenCalled();
      expect(GamificationPublisher.publishBadgeEarned).not.toHaveBeenCalled();
    });

    test('should get user badges', async () => {
      const userId = 'test-user-123';
      const badges = [{ id: 'badge-1', name: 'Eco Warrior' }];

      prisma.userBadge.findMany.mockResolvedValue(badges);

      const result = await BadgeService.getUserBadges(userId);

      expect(prisma.userBadge.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { badge: true },
      });
      expect(result).toEqual(badges);
    });
  });
});
