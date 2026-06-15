const LeaderboardService = require('../src/services/leaderboardService'); // Assuming a LeaderboardService exists
const { PrismaClient } = require('@prisma/client');

const mockUserActionGroupBy = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      userAction: { groupBy: mockUserActionGroupBy },
    })),
  };
});

describe('LeaderboardService', () => {
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    // Reset mocks before each test
    mockUserActionGroupBy.mockClear();
  });

  describe('Leaderboard', () => {
    test('should get leaderboard rankings', async () => {
      const mockRankings = [
        { userId: 'user-1', _sum: { points: 500 } },
        { userId: 'user-2', _sum: { points: 400 } },
      ];
      mockUserActionGroupBy.mockResolvedValue(mockRankings);

      // Assuming LeaderboardService has a getLeaderboard method
      const result = await LeaderboardService.getLeaderboard();

      expect(mockUserActionGroupBy).toHaveBeenCalledWith({
        by: ['userId'],
        _sum: { points: true },
        orderBy: { _sum: { points: 'desc' } },
      });
      expect(result).toEqual(mockRankings);
    });
  });
});