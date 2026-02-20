import prisma from "../prisma/client.js";

class ContainerRepository {
  async findAll() {
    return prisma.conteneur.findMany();
  }

  async findById(id) {
    return prisma.conteneur.findUnique({
      where: { id_conteneur: id },
    });
  }

  async findByName(codeConteneur) {
    return prisma.conteneur.findFirst({
      where: { code_conteneur: codeConteneur },
    });
  }

  async create(data) {
    return prisma.conteneur.create({
      data,
    });
  }

  async update(id, data) {
    return prisma.conteneur.update({
      where: { id_conteneur: id },
      data,
    });
  }

  async delete(id) {
    return prisma.conteneur.delete({
      where: { id_conteneur: id },
    });
  }

  async findNearby(latitude, longitude, radius) {
    // Exemple simple (à optimiser plus tard avec PostGIS)
    return prisma.$queryRaw`
      SELECT *
      FROM "conteneur"
      WHERE earth_distance(
        ll_to_earth(latitude, longitude),
        ll_to_earth(${latitude}, ${longitude})
      ) <= ${radius}
    `;
  }

  async findByFilters(filters) {
    const where = {};
    if (filters.type_Dechet) where.type_Dechet = filters.type_Dechet;
    if (filters.id_Zone) where.id_Zone = filters.id_Zone;
    if (filters.Statut) where.Statut = filters.Statut;
    if (filters.code_conteneur) where.code_conteneur = filters.code_conteneur;

    return prisma.conteneur.findMany({
      where,
    });
  }
}

export default new ContainerRepository();