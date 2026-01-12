require("dotenv").config();
const { prisma } = require("../config/postgres");
const userSeeder = require("./seeders/userSeeder");
const notificationSeeder = require("./seeders/notificationSeeder");

async function runSeeders() {
  await prisma.$connect();
  console.log("DB connected");

  await userSeeder(prisma);
  await notificationSeeder(prisma);

  console.log("Tous les seeders ont été exécutés !");
  await prisma.$disconnect();
  process.exit();
}

runSeeders();

// to run this file: node src/database/index.js