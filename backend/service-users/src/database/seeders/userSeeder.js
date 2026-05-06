const bcrypt = require("bcryptjs");

module.exports = async (prisma) => {
  const password = await bcrypt.hash("password", 10);
  
  // Nettoyer les données existantes
  await prisma.user.deleteMany();
  
  // Créer les utilisateurs
  const users = await prisma.user.createMany({
    data: [
      {
        name: "Alice",
        username: "alice123",
        email: "alice@mail.com", 
        phone: "1234567890",
        password: password
      },
      {
        name: "Bob", 
        username: "bob123",
        email: "bob@mail.com",
        phone: "0987654321",
        password: password
      },
      {
        name: "citizen1",
        username: "citizen1",
        email: "citizen1@example.com",
        phone: "1111111111",
        password: password
      },
      {
        name: "agent1",
        username: "agent1",
        email: "agent1@example.com",
        phone: "2222222222",
        password: password
      },
      {
        name: "manager1",
        username: "manager1",
        email: "manager1@example.com",
        phone: "3333333333",
        password: password
      },
      {
        name: "admin1",
        username: "admin1",
        email: "admin1@example.com",
        phone: "4444444444",
        password: password
      }
    ]
  });
  
  // Récupérer tous les rôles
  const citizenRole = await prisma.role.findUnique({ where: { name: 'citizen' } });
  const agentRole = await prisma.role.findUnique({ where: { name: 'agent' } });
  const managerRole = await prisma.role.findUnique({ where: { name: 'manager' } });
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  
  // Récupérer les utilisateurs créés
  const alice = await prisma.user.findUnique({ where: { email: 'alice@mail.com' } });
  const bob = await prisma.user.findUnique({ where: { email: 'bob@mail.com' } });
  const citizen1 = await prisma.user.findUnique({ where: { email: 'citizen1@example.com' } });
  const agent1 = await prisma.user.findUnique({ where: { email: 'agent1@example.com' } });
  const manager1 = await prisma.user.findUnique({ where: { email: 'manager1@example.com' } });
  const admin1 = await prisma.user.findUnique({ where: { email: 'admin1@example.com' } });
  
  // Assigner les rôles aux utilisateurs
  if (alice && citizenRole) {
    await prisma.user.update({
      where: { id: alice.id },
      data: { roles: { connect: { id: citizenRole.id } } }
    });
  }
  
  if (bob && citizenRole) {
    await prisma.user.update({
      where: { id: bob.id },
      data: { roles: { connect: { id: citizenRole.id } } }
    });
  }
  
  if (citizen1 && citizenRole) {
    await prisma.user.update({
      where: { id: citizen1.id },
      data: { roles: { connect: { id: citizenRole.id } } }
    });
  }
  
  if (agent1 && agentRole) {
    await prisma.user.update({
      where: { id: agent1.id },
      data: { roles: { connect: { id: agentRole.id } } }
    });
  }
  
  if (manager1 && managerRole) {
    await prisma.user.update({
      where: { id: manager1.id },
      data: { roles: { connect: { id: managerRole.id } } }
    });
  }
  
  if (admin1 && adminRole) {
    await prisma.user.update({
      where: { id: admin1.id },
      data: { roles: { connect: { id: adminRole.id } } }
    });
  }
};
