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
    const user = await prisma.user.findUnique({ where: { id } });
    return attachCompare(user);
  },
  findOne: async (query) => {
    // expecting query like { email }
    const user = await prisma.user.findUnique({ where: { email: query.email } });
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
  }
}; 
