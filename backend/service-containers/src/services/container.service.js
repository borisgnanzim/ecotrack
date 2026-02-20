import ContainerRepository from "../repositories/container.repository.js";
import { NotFoundError, ConflictError } from "../utils/errors.js";

class ContainerService {
  async getContainerById(id) {
    const container = await ContainerRepository.findById(id);

    if (!container) {
      throw new NotFoundError("Conteneur introuvable");
    }

    return container;
  }

  async getAllContainers() {
    return ContainerRepository.findAll();
  }

  async createContainer(data) {
    // Règle métier : unicité du code_conteneur
    const exists = await ContainerRepository.findByName(data.code_conteneur);
    if (exists) {
      throw new ConflictError("Un conteneur avec ce code existe déjà");
    }

    return ContainerRepository.create(data);
  }

  async updateContainer(id, data) {
    const container = await ContainerRepository.findById(id);
    if (!container) {
      throw new NotFoundError("Conteneur introuvable");
    }

    return ContainerRepository.update(id, data);
  }

  async deleteContainer(id) {
    const container = await ContainerRepository.findById(id);
    if (!container) {
      throw new NotFoundError("Conteneur introuvable");
    }

    await ContainerRepository.delete(id);
  }

  async searchContainers(filters) {
    const results = await ContainerRepository.findByFilters(filters);
    if (results.length === 0) {
      throw new NotFoundError("Conteneur non trouvé");
    }
    return results;
  }

  async getStats() {
    const containers = await ContainerRepository.findAll();
    
    if (containers.length === 0) {
      return {
        total: 0,
        parType: {},
        statusCount: {},
        totalCapacity: 0,
        averageFillLevel: null,
      };
    }

    const stats = {
      total: containers.length,
      parType: {},
      statusCount: {},
      totalCapacity: 0,
      averageFillLevel: null,
    };

    let totalFillLevel = 0;
    let countWithFill = 0;

    containers.forEach((c) => {
      // Compter par type
      stats.parType[c.type_Dechet] = (stats.parType[c.type_Dechet] || 0) + 1;
      
      // Compter par statut
      stats.statusCount[c.Statut || "normal"] = (stats.statusCount[c.Statut || "normal"] || 0) + 1;
      
      // Capacité totale
      stats.totalCapacity += c.capacite_i || 0;
    });

    return stats;
  }
}

export default new ContainerService();