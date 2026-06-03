import ContainerRepository from '../repositories/container.repository.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

class ContainerService {
  async getContainerById(id) {
    const container = await ContainerRepository.findById(id);

    if (!container) {
      throw new NotFoundError('Conteneur introuvable');
    }

    return container;
  }

  async getAllContainers() {
    return ContainerRepository.findAll();
  }

  async createContainer(data) {
    // Règle métier : unicité du code
    const exists = await ContainerRepository.findByCode(data.code);
    if (exists) {
      throw new ConflictError('Un conteneur avec ce code existe déjà');
    }

    return ContainerRepository.create(data);
  }

  async updateContainer(id, data) {
    const container = await ContainerRepository.findById(id);
    if (!container) {
      throw new NotFoundError('Conteneur introuvable');
    }

    // Vérifier l'unicité du code si modifié
    if (data.code && data.code !== container.code) {
      const exists = await ContainerRepository.findByCode(data.code);
      if (exists) {
        throw new ConflictError('Un conteneur avec ce code existe déjà');
      }
    }

    return ContainerRepository.update(id, data);
  }

  async deleteContainer(id) {
    const container = await ContainerRepository.findById(id);
    if (!container) {
      throw new NotFoundError('Conteneur introuvable');
    }

    await ContainerRepository.delete(id);
  }

  async searchContainers(filters) {
    const results = await ContainerRepository.findByFilters(filters);
    if (results.length === 0) {
      throw new NotFoundError('Aucun conteneur trouvé');
    }
    return results;
  }

  async getContainersByZone(zoneId) {
    return ContainerRepository.findByZone(zoneId);
  }

  async getStats() {
    const containers = await ContainerRepository.findAll();

    if (containers.length === 0) {
      return {
        total: 0,
        parType: {},
        statusCount: {},
        totalCapacity: 0,
      };
    }

    const stats = {
      total: containers.length,
      parType: {},
      statusCount: {},
      totalCapacity: 0,
    };

    containers.forEach((c) => {
      // Compter par type
      stats.parType[c.type] = (stats.parType[c.type] || 0) + 1;

      // Compter par statut
      stats.statusCount[c.status || 'active'] = (stats.statusCount[c.status || 'active'] || 0) + 1;

      // Capacité totale
      stats.totalCapacity += c.capacity || 0;
    });

    return stats;
  }
}

export default new ContainerService();