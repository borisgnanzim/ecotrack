const bcrypt = require('bcryptjs');
const { prisma } = require('../config/postgres');

function attachCompare(user) {
  if (!user) return null;
  user.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, user.password);
  };
  return user;
}

module.exports = {
  find: async () => {
    return prisma.user.findMany();
  },
  findById: async (id) => {
    const user = await prisma.user.findUnique({ where: { id }, include: { roles: true } });
    return attachCompare(user);
  },
  findOne: async (query) => {
    // expecting query like { email }
    const user = await prisma.user.findUnique({ where: { email: query.email }, include: { roles: true } });
    return attachCompare(user);
  },
  create: async (data) => {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = await prisma.user.create({ data });
    return attachCompare(user);
  },
  findByIdAndUpdate: async (id, update, options) => {
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }
    const updated = await prisma.user.update({ where: { id }, data: update });
    return attachCompare(updated);
  },
  findByIdAndDelete: async (id) => {
    return prisma.user.delete({ where: { id } });
  },
  deleteMany: async () => {
    return prisma.user.deleteMany();
  },
  insertMany: async (users) => {
    const data = await Promise.all(users.map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, 10) })));
    return prisma.user.createMany({ data });
  },

  addRole: async (userId, roleName) => {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error(`Role ${roleName} not found`);
    
    return prisma.user.update({
      where: { id: userId },
      data: {
        roles: { connect: { id: role.id } }
      },
      include: { roles: true }
    });
  },

  removeRole: async (userId, roleName) => {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error(`Role ${roleName} not found`);
    
    return prisma.user.update({
      where: { id: userId },
      data: {
        roles: { disconnect: { id: role.id } }
      },
      include: { roles: true }
    });
  },

  updateRoles: async (userId, roleNames) => {
    const roles = await prisma.role.findMany({
      where: { name: { in: roleNames } }
    });
    
    return prisma.user.update({
      where: { id: userId },
      data: {
        roles: { set: roles.map(r => ({ id: r.id })) }
      },
      include: { roles: true }
    });
  }
}; 
