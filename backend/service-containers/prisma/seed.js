import "dotenv/config";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────────────────────────

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, dec = 6) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Reference data ────────────────────────────────────────────────────────────

const ZONES = [
  // ── Paris ────────────────────────────────────────────────────────────────────
  { id: 'FR-PAR-01', name: 'Paris Centre',        city: 'Paris',     district: '1er-4e arrondissement', latitude: 48.8566, longitude: 2.3522  },
  { id: 'FR-PAR-02', name: 'Paris Rive Gauche',   city: 'Paris',     district: '5e-7e arrondissement',  latitude: 48.8490, longitude: 2.3360  },
  { id: 'FR-PAR-03', name: 'Paris Nord',          city: 'Paris',     district: '18e-19e arrondissement',latitude: 48.8843, longitude: 2.3530  },
  { id: 'FR-PAR-04', name: 'Paris Est',           city: 'Paris',     district: '11e-12e arrondissement',latitude: 48.8534, longitude: 2.3835  },
  { id: 'FR-PAR-05', name: 'Paris Ouest',         city: 'Paris',     district: '16e-17e arrondissement',latitude: 48.8652, longitude: 2.2885  },

  // ── Lyon ─────────────────────────────────────────────────────────────────────
  { id: 'FR-LYO-01', name: 'Lyon Presqu\'île',    city: 'Lyon',      district: '1er-2e arrondissement', latitude: 45.7600, longitude: 4.8340  },
  { id: 'FR-LYO-02', name: 'Lyon Part-Dieu',      city: 'Lyon',      district: '3e arrondissement',     latitude: 45.7605, longitude: 4.8591  },
  { id: 'FR-LYO-03', name: 'Lyon Confluence',     city: 'Lyon',      district: '2e arrondissement',     latitude: 45.7440, longitude: 4.8155  },

  // ── Marseille ─────────────────────────────────────────────────────────────────
  { id: 'FR-MRS-01', name: 'Marseille Vieux-Port',city: 'Marseille', district: '1er-7e arrondissement', latitude: 43.2965, longitude: 5.3698  },
  { id: 'FR-MRS-02', name: 'Marseille Nord',      city: 'Marseille', district: '13e-15e arrondissement',latitude: 43.3350, longitude: 5.4020  },
  { id: 'FR-MRS-03', name: 'Marseille Sud',       city: 'Marseille', district: '8e-9e arrondissement',  latitude: 43.2600, longitude: 5.3900  },

  // ── Toulouse ──────────────────────────────────────────────────────────────────
  { id: 'FR-TLS-01', name: 'Toulouse Centre',     city: 'Toulouse',  district: 'Capitole',              latitude: 43.6047, longitude: 1.4442  },
  { id: 'FR-TLS-02', name: 'Toulouse Minimes',    city: 'Toulouse',  district: 'Minimes',               latitude: 43.6200, longitude: 1.4380  },

  // ── Nice ──────────────────────────────────────────────────────────────────────
  { id: 'FR-NCE-01', name: 'Nice Vieux-Nice',     city: 'Nice',      district: 'Vieux-Nice',            latitude: 43.6961, longitude: 7.2767  },
  { id: 'FR-NCE-02', name: 'Nice Promenade',      city: 'Nice',      district: 'Promenade des Anglais', latitude: 43.6952, longitude: 7.2637  },

  // ── Bordeaux ──────────────────────────────────────────────────────────────────
  { id: 'FR-BOD-01', name: 'Bordeaux Centre',     city: 'Bordeaux',  district: 'Triangle d\'or',        latitude: 44.8378, longitude: -0.5792 },
  { id: 'FR-BOD-02', name: 'Bordeaux Chartrons',  city: 'Bordeaux',  district: 'Chartrons',             latitude: 44.8530, longitude: -0.5700 },

  // ── Nantes ────────────────────────────────────────────────────────────────────
  { id: 'FR-NAN-01', name: 'Nantes Centre',       city: 'Nantes',    district: 'Centre-ville',          latitude: 47.2184, longitude: -1.5536 },
  { id: 'FR-NAN-02', name: 'Nantes Ile de Nantes',city: 'Nantes',    district: 'Île de Nantes',         latitude: 47.2040, longitude: -1.5580 },

  // ── Strasbourg ────────────────────────────────────────────────────────────────
  { id: 'FR-STR-01', name: 'Strasbourg Centre',   city: 'Strasbourg',district: 'Grande Île',            latitude: 48.5734, longitude: 7.7521  },
];

const CONTAINER_TYPES = ['plastique', 'papier', 'verre', 'compost'];
const CONTAINER_STATUSES = ['normal', 'plein', 'en_maintenance', 'desactive'];

// ── Seed zones ────────────────────────────────────────────────────────────────

async function seedZones() {
  console.log('📍 Creating zones...');
  let created = 0;
  for (const zone of ZONES) {
    try {
      await prisma.zone.upsert({
        where: { id: zone.id },
        create: {
          ...zone,
          description: `Zone de collecte — ${zone.district}, ${zone.city}`,
          isActive: true,
          // Simple square polygon around the centroid
          polygon: {
            type: 'Polygon',
            coordinates: [[
              [zone.longitude - 0.01, zone.latitude - 0.008],
              [zone.longitude + 0.01, zone.latitude - 0.008],
              [zone.longitude + 0.01, zone.latitude + 0.008],
              [zone.longitude - 0.01, zone.latitude + 0.008],
              [zone.longitude - 0.01, zone.latitude - 0.008],
            ]],
          },
        },
        update: {},
      });
      created++;
    } catch (err) {
      console.error(`  ⚠ Zone ${zone.id}: ${err.message}`);
    }
  }
  console.log(`  ✅ ${created}/${ZONES.length} zones créées`);
  return ZONES;
}

// ── Seed containers ───────────────────────────────────────────────────────────

async function seedContainers(count, zones) {
  console.log(`\n📦 Creating ${count} containers...`);

  const batchSize = 500;
  let created = 0;
  const baseCode = Date.now() % 900000 + 100000; // 6-digit base

  while (created < count) {
    const thisBatch = Math.min(batchSize, count - created);
    const zone = sample(zones);

    const data = Array.from({ length: thisBatch }, (_, i) => {
      // Distribute coordinates around zone centroid
      const lat = randFloat(zone.latitude - 0.008, zone.latitude + 0.008);
      const lon = randFloat(zone.longitude - 0.01, zone.longitude + 0.01);
      return {
        type:      sample(CONTAINER_TYPES),
        status:    sample(CONTAINER_STATUSES),
        zoneId:    zone.id,
        capacity:  randInt(50, 500),
        fillLevel: randInt(0, 100),
        code:      baseCode + created + i + 1,
        latitude:  lat,
        longitude: lon,
        photoUrl:  null,
      };
    });

    try {
      await prisma.container.createMany({ data, skipDuplicates: true });
      created += thisBatch;
      if (created % 1000 === 0 || created === count) {
        console.log(`  ✅ ${created}/${count} inserted`);
      }
    } catch (err) {
      // Fallback to individual inserts on batch failure
      for (const item of data) {
        try {
          await prisma.container.create({ data: item });
          created++;
        } catch (e) {
          if (e.code !== 'P2002') console.error('  ⚠ insert error', e.message);
        }
      }
    }
  }

  console.log(`  ✅ Done: ${created} containers`);
}

// ── Seed fill history ─────────────────────────────────────────────────────────

async function seedFillHistory(samplesPerContainer = 5) {
  console.log(`\n📊 Creating fill history (${samplesPerContainer} records/container)...`);

  const containers = await prisma.container.findMany({ select: { id: true, fillLevel: true }, take: 200 });
  const now = new Date();
  let total = 0;

  for (const container of containers) {
    const records = Array.from({ length: samplesPerContainer }, (_, i) => {
      const daysAgo = (samplesPerContainer - i) * randInt(2, 5);
      const recordedAt = new Date(now);
      recordedAt.setDate(recordedAt.getDate() - daysAgo);
      return {
        containerId: container.id,
        fillLevel:   randInt(0, 100),
        recordedAt,
      };
    });

    try {
      await prisma.fillHistory.createMany({ data: records, skipDuplicates: true });
      total += records.length;
    } catch (err) {
      // silent skip
    }
  }

  console.log(`  ✅ ${total} fill history records created`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const argv = process.argv.slice(2);
  let count = 100;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--count=')) count = parseInt(a.split('=')[1], 10);
    else if (a === '--count' && argv[i + 1]) count = parseInt(argv[i + 1], 10);
  }
  if (!Number.isInteger(count) || count <= 0) count = 100;

  console.log('🌱 EcoTrack — Seeding database\n');

  try {
    const zones = await seedZones();
    await seedContainers(count, zones);
    await seedFillHistory(5);
    console.log('\n✅ Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
