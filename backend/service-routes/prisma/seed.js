const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {

  await prisma.route.create({
    data: {
      date: new Date(),
      agent_id: 1,
      status: "planned"
    }
  });

  console.log("Seed completed");

}

main()
.finally(() => prisma.$disconnect());