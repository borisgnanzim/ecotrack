import "dotenv/config";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────────────────────────

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, dec = 6) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Reference data ────────────────────────────────────────────────────────────

const ZONES = [
  { id: 'ZD-PLAT',  name: 'Zone Plateau',         city: 'Dakar',   district: 'Plateau',           latitude: 14.6937, longitude: -17.4441 },
  { id: 'ZD-MEDI',  name: 'Zone Médina',           city: 'Dakar',   district: 'Médina',            latitude: 14.6954, longitude: -17.4558 },
  { id: 'ZD-GUEL',  name: 'Zone Gueule Tapée',     city: 'Dakar',   district: 'Gueule Tapée',      latitude: 14.6898, longitude: -17.4505 },
  { id: 'ZD-REBT',  name: 'Zone Rebeuss',          city: 'Dakar',   district: 'Rebeuss',           latitude: 14.6876, longitude: -17.4419 },
  { id: 'ZD-BELA',  name: 'Zone Bel Air',          city: 'Dakar',   district: 'Bel Air',           latitude: 14.6802, longitude: -17.4356 },
  { id: 'ZD-HANN',  name: 'Zone Hann Bel Air',     city: 'Dakar',   district: 'Hann',              latitude: 14.7158, longitude: -17.4121 },
  { id: 'ZP-KEUR',  name: 'Zone Keur Massar',      city: 'Pikine',  district: 'Keur Massar',       latitude: 14.7528, longitude: -17.3264 },
  { id: 'ZP-THIA',  name: 'Zone Thiaroye',         city: 'Pikine',  district: 'Thiaroye',          latitude: 14.7463, longitude: -17.3812 },
  { id: 'ZP-GUID',  name: 'Zone Guédiawaye',       city: 'Guédiawaye', district: 'Sam Notaire',    latitude: 14.7736, longitude: -17.4012 },
  { id: 'ZR-SAND',  name: 'Zone Sand',             city: 'Rufisque', district: 'Sand',             latitude: 14.7197, longitude: -17.2747 },
  { id: 'ZD-ALMAD', name: 'Zone Almadies',         city: 'Dakar',   district: 'Almadies',          latitude: 14.7457, longitude: -17.5145 },
  { id: 'ZD-NGOR',  name: 'Zone Ngor-Yoff',        city: 'Dakar',   district: 'Ngor',              latitude: 14.7599, longitude: -17.5232 },
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
