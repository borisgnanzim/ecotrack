import prisma from '../prisma/client.js';

class ContainerRepository {
  async findAll() {
    return prisma.container.findMany({
      include: { fillHistory: false },
    });
  }

  async findById(id) {
    return prisma.container.findUnique({
      where: { id },
      include: { fillHistory: false },
    });
  }

  async findByCode(code) {
    return prisma.container.findUnique({
      where: { code },
      include: { fillHistory: false },
    });
  }

  async create(data) {
    return prisma.container.create({
      data,
      include: { fillHistory: false },
    });
  }

  async update(id, data) {
    return prisma.container.update({
      where: { id },
      data,
      include: { fillHistory: false },
    });
  }

  async delete(id) {
    return prisma.container.delete({
      where: { id },
    });
  }

  async findByFilters(filters) {
    const where = {};
    if (filters.type) where.type = filters.type;
    if (filters.zoneId) where.zoneId = filters.zoneId;
    if (filters.status) where.status = filters.status;
    if (filters.code) where.code = filters.code;

    return prisma.container.findMany({
      where,
      include: { fillHistory: false },
    });
  }

  async findByZone(zoneId) {
    return prisma.container.findMany({
      where: { zoneId },
      include: { fillHistory: false },
    });
  }
}

export default new ContainerRepository();