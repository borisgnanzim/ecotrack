const { prisma } = require('../config/postgres');

module.exports = {
  create: async (data) => {
    return prisma.notification.create({ data });
  },
  find: async () => {
    return prisma.notification.findMany();
  },
  findById: async (id) => {
    return prisma.notification.findUnique({ where: { id } });
  },
  findByUserId: async (userId) => {
    return prisma.notification.findMany({ where: { userId } });
  },
  findByIdAndUpdate: async (id, update) => {
    return prisma.notification.update({ where: { id }, data: update });
  },
  findByIdAndDelete: async (id) => {
    return prisma.notification.delete({ where: { id } });
  },
  deleteMany: async (where = {}) => {
    return prisma.notification.deleteMany({ where });
  }
};