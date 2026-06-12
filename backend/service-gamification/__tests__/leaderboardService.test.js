const LeaderboardService = require('../src/services/leaderboardService'); // Assuming a LeaderboardService exists
const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client');

describe('LeaderboardService', () => {
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    // Reset mocks before each test
    mockPrisma.userAction.groupBy.mockClear();
  });

  describe('Leaderboard', () => {
    test('should get leaderboard rankings', async () => {
      const mockRankings = [
        { userId: 'user-1', _sum: { points: 500 } },
        { userId: 'user-2', _sum: { points: 400 } },
      ];

      mockPrisma.userAction.groupBy.mockResolvedValue(mockRankings);

      // Assuming LeaderboardService has a getLeaderboard method
      const result = await LeaderboardService.getLeaderboard();

      expect(mockPrisma.userAction.groupBy).toHaveBeenCalledWith({
        by: ['userId'],
        _sum: { points: true },
        orderBy: { _sum: { points: 'desc' } },
      });
      expect(result).toEqual(mockRankings);
    });
  });
});