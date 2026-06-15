const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');

// Mock Prisma for testing to prevent database connection errors during tests
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    userAction: {
      aggregate: jest.fn(),
      create: jest.fn(), // Added create for addPoints if needed
    },
    userBadge: {
      create: jest.fn(),
    },
    challenge: {
      create: jest.fn(),
    },
    challengeParticipation: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    // Add other models and methods as needed for your tests
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

jest.mock('../kafka/gamificationPublisher', () => ({
  publishGamificationEvent: jest.fn(),
}));

describe('Service Gamification', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'service-gamification',
    });
  });

  it('should return user points', async () => {
    // Mock Prisma response for getUserTotalPoints to return a valid sum
    const mockPrisma = new PrismaClient();
    mockPrisma.userAction.aggregate.mockResolvedValue({
      _sum: { points: 150 },
    });

    const response = await request(app).get('/api/gamification/points/123');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      userId: '123',
    });
  });

  it('should award a reward', async () => {
    const response = await request(app)
      // Corrected endpoint path: it should be /api/gamification/points/reward/:userId
      // based on the router setup in points.routes.js and index.js
      .post('/api/gamification/points/reward/123')
      .send({ reward: 'eco-badge' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      reward: 'eco-badge',
    });
  });
});
