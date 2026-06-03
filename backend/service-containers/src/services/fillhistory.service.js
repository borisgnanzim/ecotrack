import FillHistoryRepository from '../repositories/fillhistory.repository.js';
import ContainerRepository from '../repositories/container.repository.js';
import { NotFoundError } from '../utils/errors.js';
import { emitFillLevelUpdate, emitCriticalAlert } from '../sockets/container.socket.js';

class FillHistoryService {
  async addFillHistory(containerId, data) {
    const container = await ContainerRepository.findById(containerId);

    if (!container) {
      throw new NotFoundError('Conteneur introuvable');
    }

    const history = await FillHistoryRepository.create({
      containerId,
      fillLevel: data.fillLevel,
      recordedAt: data.recordedAt ?? new Date(),
    });

    // LOGIQUE MÉTIER CRITIQUE
    if (data.fillLevel >= 85) {
      console.warn(`⚠️ Conteneur ${containerId} critique (${data.fillLevel}%)`);
      emitCriticalAlert(containerId, data.fillLevel);
    } else {
      emitFillLevelUpdate(containerId, data.fillLevel);
    }

    return history;
  }

  async getFillHistory(containerId) {
    const container = await ContainerRepository.findById(containerId);

    if (!container) {
      throw new NotFoundError('Conteneur introuvable');
    }

    return FillHistoryRepository.findByContainerId(containerId);
  }

  async getLatestFillLevel(containerId) {
    const container = await ContainerRepository.findById(containerId);

    if (!container) {
      throw new NotFoundError('Conteneur introuvable');
    }

    return FillHistoryRepository.findLatestByContainerId(containerId);
  }
}

export default new FillHistoryService();