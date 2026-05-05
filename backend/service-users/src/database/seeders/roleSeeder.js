const roleSeeder = async (prisma) => {
  const roles = [
    { name: "citizen" },
    { name: "agent" },
    { name: "manager" },
    { name: "analyst" },
    { name: "admin" }
  ];

  for (const role of roles) {
    const existingRole = await prisma.role.findUnique({
      where: { name: role.name }
    });
    
    if (!existingRole) {
      await prisma.role.create({
        data: role
      });
      console.log(`Rôle ${role.name} créé`);
    } else {
      console.log(`Rôle ${role.name} existe déjà`);
    }
  }
};

module.exports = roleSeeder;
