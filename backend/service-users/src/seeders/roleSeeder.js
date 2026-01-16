const roles = [
  { name: 'citizen' },
  { name: 'agent' },
  { name: 'manager' },
  { name: 'admin' }
];

async function seedRoles(prisma) {
  for (const role of roles) {
    await prisma.role.create({ data: role });
  }
}

module.exports = seedRoles;