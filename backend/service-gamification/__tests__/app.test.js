const request = require('supertest');
const app = require('../app');

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
    const response = await request(app).get('/api/gamification/points/123');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      userId: '123',
      points: expect.any(Number),
      level: expect.any(Number),
    });
  });

  it('should award a reward', async () => {
    const response = await request(app)
      .post('/api/gamification/reward/123')
      .send({ reward: 'eco-badge' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      userId: '123',
      reward: 'eco-badge',
      status: 'awarded',
    });
  });
});
