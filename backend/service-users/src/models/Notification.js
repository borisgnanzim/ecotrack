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
  findByUserIdPaginated: async (userId, options) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const take = limit;
    const where = { userId };

    const [data, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        skip,
        take
      }),
      prisma.notification.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
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