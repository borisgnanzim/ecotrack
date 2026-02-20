import prisma from "../prisma/client.js";

class FillHistoryRepository {
  async create(data) {
    return prisma.fillHistory.create({
      data: {
        niveau: data.niveau,
        recordedAt: data.recordedAt,
        conteneurId: data.conteneurId,
      },
    });
  }

  async findByContainerId(conteneurId) {
    return prisma.fillHistory.findMany({
      where: { conteneurId },
      orderBy: { recordedAt: "desc" },
    });
  }
}

export default new FillHistoryRepository();