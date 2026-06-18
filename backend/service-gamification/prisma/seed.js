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
      name: 'Signaler 10 conteneurs',
      description: 'Signalez 10 conteneurs défectueux ou mal placés',
      targetValue: 10,
      rewardPoints: 100,
      type: 'individual',
      period: 'weekly',
    },
    {
      name: 'Zéro débordement du quartier',
      description: 'Collectif: évitez tout débordement dans votre quartier cette semaine',
      targetValue: 50,
      rewardPoints: 250,
      type: 'collective',
      period: 'weekly',
    },
    {
      name: 'Challenge mensuel: 100 actions',
      description: 'Complétez 100 actions (reports, défis, participation)',
      targetValue: 100,
      rewardPoints: 500,
      type: 'individual',
      period: 'monthly',
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

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Extended test data: create sample users, actions, totals, and some user badges/participations
async function seedTestData() {
  console.log('Seeding extended test data...');

  const users = [
    { id: 'user-1', name: 'Alice' },
    { id: 'user-2', name: 'Bob' },
    { id: 'user-3', name: 'Charlie' },
    { id: 'user-4', name: 'Dana' },
  ];

  // create sample user actions (reports and other actions)
  const actions = [
    { userId: 'user-1', actionType: 'report_container', points: 10 },
    { userId: 'user-1', actionType: 'report_container', points: 10 },
    { userId: 'user-1', actionType: 'complete_challenge', points: 50 },
    { userId: 'user-2', actionType: 'report_container', points: 10 },
    { userId: 'user-2', actionType: 'submit_feedback', points: 5 },
    { userId: 'user-3', actionType: 'complete_challenge', points: 50 },
    { userId: 'user-3', actionType: 'report_container', points: 10 },
    { userId: 'user-3', actionType: 'report_container', points: 10 },
    { userId: 'user-4', actionType: 'submit_feedback', points: 5 },
  ];

  // ensure badges exist (seed created them earlier)
  const allBadges = await prisma.badge.findMany();

  // create user actions and compute totals
  for (const a of actions) {
    await prisma.userAction.create({ data: a });
  }

  // create UserTotalPoints per user based on aggregate of actions
  for (const u of users) {
    const agg = await prisma.userAction.aggregate({
      _sum: { points: true },
      where: { userId: u.id },
    });
    const total = agg._sum.points || 0;
    await prisma.userTotalPoints.upsert({
      where: { userId: u.id },
      create: { userId: u.id, totalPoints: total },
      update: { totalPoints: total },
    });
  }

  // award badges to users depending on totals (idempotent)
  for (const u of users) {
    const ut = await prisma.userTotalPoints.findUnique({ where: { userId: u.id } });
    if (!ut) continue;
    const earned = allBadges.filter(b => b.pointsRequired <= ut.totalPoints);
    for (const b of earned) {
      const exists = await prisma.userBadge.findFirst({ where: { userId: u.id, badgeId: b.id } });
      if (!exists) {
        await prisma.userBadge.create({ data: { userId: u.id, badgeId: b.id } });
      }
    }
  }

  // create sample participations for first challenge
  const firstChallenge = await prisma.challenge.findFirst();
  if (firstChallenge) {
    await prisma.userChallenge.upsert({
      where: { userId_challengeId: { userId: 'user-1', challengeId: firstChallenge.id } },
      create: { userId: 'user-1', challengeId: firstChallenge.id, currentProgress: 3 },
      update: { currentProgress: 3 },
    });
    await prisma.userChallenge.upsert({
      where: { userId_challengeId: { userId: 'user-2', challengeId: firstChallenge.id } },
      create: { userId: 'user-2', challengeId: firstChallenge.id, currentProgress: 1 },
      update: { currentProgress: 1 },
    });
  }

  console.log('Extended test data seeded');
}

// Run extended seeding after main seed
main().then(() => seedTestData()).catch(e => console.error('Extended seed failed', e));
