const LeaderboardService = require('../src/services/leaderboardService');

jest.mock('../src/config/postgres', () => ({
  prisma: {
    userAction: { groupBy: jest.fn() },
  },
}));

const { prisma } = require('../src/config/postgres');

describe('LeaderboardService', () => {
  beforeEach(() => {
    prisma.userAction.groupBy.mockClear();
  });

  describe('Leaderboard', () => {
    test('should get leaderboard rankings', async () => {
      const mockGroupByResult = [
        { userId: 'user-1', _sum: { points: 500 } },
        { userId: 'user-2', _sum: { points: 400 } },
      ];
      prisma.userAction.groupBy.mockResolvedValue(mockGroupByResult);

      const result = await LeaderboardService.getLeaderboard();

      expect(prisma.userAction.groupBy).toHaveBeenCalledWith({
        by: ['userId'],
        _sum: { points: true },
        orderBy: { _sum: { points: 'desc' } },
        take: undefined,
      });
      expect(result).toEqual([
        { rank: 1, userId: 'user-1', points: 500 },
        { rank: 2, userId: 'user-2', points: 400 },
      ]);
    });
  });
});
