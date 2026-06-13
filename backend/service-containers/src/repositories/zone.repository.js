import prisma from '../prisma/client.js';

class ZoneRepository {
  async findAll() {
    return prisma.zone.findMany({
      include: {
        containers: {
          select: { fillLevel: true, status: true, type: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id) {
    return prisma.zone.findUnique({
      where: { id },
      include: {
        containers: {
          select: { id: true, fillLevel: true, status: true, type: true, latitude: true, longitude: true, code: true },
        },
      },
    });
  }

  async findByName(name) {
    return prisma.zone.findUnique({ where: { name } });
  }

  async create(data) {
    return prisma.zone.create({ data });
  }

  async update(id, data) {
    return prisma.zone.update({ where: { id }, data });
  }

  async upsert(id, data) {
    return prisma.zone.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  async delete(id) {
    return prisma.zone.delete({ where: { id } });
  }

  async assignContainers(zoneId, containerIds) {
    return prisma.container.updateMany({
      where: { id: { in: containerIds } },
      data: { zoneId },
    });
  }

  async removeContainers(containerIds) {
    return prisma.container.updateMany({
      where: { id: { in: containerIds } },
      data: { zoneId: null },
    });
  }
}

export default new ZoneRepository();
