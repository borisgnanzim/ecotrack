const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function connectDb() {
  try {
    await prisma.$connect();
    console.log('Connexion à PostgreSQL réussie');
  } catch (err) {
    console.error('Erreur de connexion à PostgreSQL :', err);
    throw err;
  }
}

module.exports = { prisma, connectDb };