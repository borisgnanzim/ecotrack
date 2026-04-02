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
          password: `password${i}`,
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
          type_Dechet: wasteTypes[i % wasteTypes.length],
          Statut: i % 2 === 0 ? 'active' : 'inactive',
          id_Zone: zones[i % zones.length],
          capacite_i: 100 + i * 5,
          code_containers: 1000 + i,
          latitude: 48.8 + Math.random() * 0.4,
          longitude: 2.2 + Math.random() * 0.4,
          photo_url: `https://example.com/container-${i}.png`,
          fill_level: Math.floor(Math.random() * 100),
        },
      }),
    );
  }

  const containerIds = containers.map((container) => container.id_conteneur);

  const routePromises = [];
  for (let i = 1; i <= 100; i += 1) {
    const selectedContainers = containerIds
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 6) + 1);

    const agent = i % 5 === 0 ? null : users[(i - 1) % users.length].id;

    routePromises.push(
      prisma.route.create({
        data: {
          date: randomDate(60),
          agent_id: agent,
          status: statuses[i % statuses.length],
          containers_list: selectedContainers,
          total_distance: parseFloat((Math.random() * 120).toFixed(2)),
          estimated_time: Math.floor(Math.random() * 180) + 30,
          steps: {
            create: selectedContainers.map((containerId, stepIndex) => ({
              container_id: containerId,
              step_order: stepIndex + 1,
              distance_from_previous:
                stepIndex === 0 ? null : parseFloat((Math.random() * 10).toFixed(2)),
            })),
          },
        },
      }),
    );
  }

  await Promise.all(routePromises);
  console.log('Seed completed: 100 routes created');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
