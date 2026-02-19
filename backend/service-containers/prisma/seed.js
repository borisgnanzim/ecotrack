import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed(count) {
  console.log(`Seeding ${count} containers...`);

  const types = ['Plastique', 'Verre', 'Papier', 'Organique', 'Metal'];
  const statuts = ['ACTIVE', 'INACTIVE'];

  const batchSize = 1000;
  let created = 0;
  const baseCode = Date.now() % 1000000; // base to avoid collisions

  while (created < count) {
    const thisBatch = Math.min(batchSize, count - created);
    const data = new Array(thisBatch).fill(0).map((_, i) => {
      const code = baseCode + created + i + 1;
      return {
        type_Dechet: sample(types),
        Statut: sample(statuts),
        id_Zone: `Z${randInt(1, 200)}`,
        capacite_i: randInt(50, 500),
        code_conteneur: code,
        latitude: parseFloat((48 + Math.random()).toFixed(6)),
        longitude: parseFloat((2 + Math.random()).toFixed(6)),
        photo_url: null
      };
    });

    // use createMany for performance
    try {
      await prisma.conteneur.createMany({ data, skipDuplicates: true });
      created += thisBatch;
      console.log(`Inserted ${created}/${count}`);
    } catch (err) {
      console.error('createMany error:', err);
      // fallback: insert one by one to get more details
      for (const item of data) {
        try {
          await prisma.conteneur.create({ data: item });
          created++;
        } catch (e) {
          // log and skip duplicates
          if (e.code === 'P2002') continue;
          console.error('insert error', e);
        }
      }
    }
  }

  console.log(`Seeding completed. Total inserted: ${created}`);
}

async function main() {
  const argv = process.argv.slice(2);
  let count = 1000;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--count=')) count = parseInt(a.split('=')[1], 10);
    if (a === '--count' && argv[i + 1]) count = parseInt(argv[i + 1], 10);
  }

  if (!Number.isInteger(count) || count <= 0) count = 1000;

  try {
    await seed(count);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
