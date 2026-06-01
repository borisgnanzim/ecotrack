const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default badges
  const badges = [
    {
      name: 'Débutner',
      description: 'Premier pas en éco-engagement',
      pointsRequired: 100,
    },
    {
      name: 'Éco-Warrior',
      description: 'Guerrier écologique confirmé',
      pointsRequired: 500,
    },
    {
      name: 'Super-Héros',
      description: 'Héros écologique suprême',
      pointsRequired: 1000,
    },
  ];

  for (const badge of badges) {
    const existing = await prisma.badge.findUnique({
      where: { name: badge.name },
    });

    if (!existing) {
      await prisma.badge.create({ data: badge });
      console.log(`✅ Created badge: ${badge.name}`);
    } else {
      console.log(`⏭️  Badge already exists: ${badge.name}`);
    }
  }

  // Create sample challenges
  const challenges = [
    {
      title: 'Signaler 10 conteneurs',
      description: 'Signalez 10 conteneurs défectueux ou mal placés',
      objective: 10,
      reward: 100,
      type: 'individual',
      period: 'weekly',
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Zéro débordement du quartier',
      description: 'Collectif: évitez tout débordement dans votre quartier cette semaine',
      objective: 50,
      reward: 250,
      type: 'collective',
      period: 'weekly',
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Challenge mensuel: 100 actions',
      description: 'Complétez 100 actions (reports, défis, participation)',
      objective: 100,
      reward: 500,
      type: 'individual',
      period: 'monthly',
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const challenge of challenges) {
    const existing = await prisma.challenge.findFirst({
      where: { title: challenge.title },
    });

    if (!existing) {
      await prisma.challenge.create({ data: challenge });
      console.log(`✅ Created challenge: ${challenge.title}`);
    } else {
      console.log(`⏭️  Challenge already exists: ${challenge.title}`);
    }
  }

  console.log('✨ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
