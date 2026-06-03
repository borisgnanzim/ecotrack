import prisma from '../prisma/client.js';

class FillHistoryRepository {
  async create(data) {
    return prisma.fillHistory.create({
      data: {
        fillLevel: data.fillLevel,
        recordedAt: data.recordedAt,
        containerId: data.containerId,
      },
    });
  }

  async findByContainerId(containerId) {
    return prisma.fillHistory.findMany({
      where: { containerId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async findLatestByContainerId(containerId) {
    return prisma.fillHistory.findFirst({
      where: { containerId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async deleteOldRecords(containerId, retentionDays = 90) {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    return prisma.fillHistory.deleteMany({
      where: {
        containerId,
        recordedAt: { lt: cutoffDate },
      },
    });
  }
}

export default new FillHistoryRepository();