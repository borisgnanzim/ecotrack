require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const statuses = ['planned', 'in_progress', 'completed', 'cancelled'];
const wasteTypes = ['plastic', 'paper', 'glass', 'organic', 'metal'];
const zones = ['North', 'South', 'East', 'West', 'Central'];

function randomDate(daysOffset = 60) {
  const now = new Date();
  const offset = Math.floor(Math.random() * daysOffset) - Math.floor(daysOffset / 2);
  return new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
}

async function main() {
  await prisma.routeStep.deleteMany();
  await prisma.route.deleteMany();
  await prisma.container.deleteMany();
  await prisma.user.deleteMany();

  const users = [];
  for (let i = 1; i <= 5; i += 1) {
    users.push(
      await prisma.user.create({
        data: {
          username: `agent${i}`,
          name: `Agent ${i}`,
          email: `agent${i}@ecotrack.local`,
          points: Math.floor(Math.random() * 500),
          address: `Rue ${i}, Ville`,
          avatar: null,
          badges: [],
        },
      }),
    );
  }

  const containers = [];
  for (let i = 1; i <= 20; i += 1) {
    containers.push(
      await prisma.container.create({
        data: {
          type: wasteTypes[i % wasteTypes.length],
          status: i % 2 === 0 ? 'active' : 'inactive',
          zoneId: zones[i % zones.length],
          capacity: 100 + i * 5,
          code: 1000 + i,
          latitude: 48.8 + Math.random() * 0.4,
          longitude: 2.2 + Math.random() * 0.4,
          photoUrl: `https://example.com/container-${i}.png`,
          fillLevel: Math.floor(Math.random() * 100),
        },
      }),
    );
  }

  const containerIds = containers.map((c) => c.id);

  const routePromises = [];
  for (let i = 1; i <= 100; i += 1) {
    const selectedIds = containerIds
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 6) + 1);

    const agentId = i % 5 === 0 ? null : users[(i - 1) % users.length].id;

    routePromises.push(
      prisma.route.create({
        data: {
          date: randomDate(60),
          agentId,
          status: statuses[i % statuses.length],
          containerIds: selectedIds,
          totalDistance: parseFloat((Math.random() * 120).toFixed(2)),
          estimatedTime: Math.floor(Math.random() * 180) + 30,
          steps: {
            create: selectedIds.map((containerId, stepIndex) => ({
              containerId,
              stepOrder: stepIndex + 1,
              distanceFromPrevious:
                stepIndex === 0 ? null : parseFloat((Math.random() * 10).toFixed(2)),
            })),
          },
        },
      }),
    );
  }

  await Promise.all(routePromises);
  console.log('Seed completed: 5 users, 20 containers, 100 routes created');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
