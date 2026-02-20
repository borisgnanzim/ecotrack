import FillHistoryRepository from "../repositories/fillhistory.repository.js";
import ContainerRepository from "../repositories/container.repository.js";
import { NotFoundError } from "../utils/errors.js";
import { emitFillLevelUpdate, emitCriticalAlert } from "../sockets/container.socket.js";

class FillHistoryService {
  async addFillHistory(containerId, data) {
    const container = await ContainerRepository.findById(containerId);

    if (!container) {
      throw new NotFoundError("Conteneur introuvable");
    }

    const history = await FillHistoryRepository.create({
      conteneurId: containerId,
      niveau: data.niveau,
      recordedAt: data.recordedAt ?? new Date(),
    });

    // LOGIQUE MÉTIER CRITIQUE
    if (data.niveau >= 85) {
      console.warn(
        `⚠️ Conteneur ${containerId} critique (${data.niveau}%)`
      );
      emitCriticalAlert(containerId, data.niveau);
    } else {
      emitFillLevelUpdate(containerId, data.niveau);
    }

    return history;
  }

  async getFillHistory(containerId) {
    const container = await ContainerRepository.findById(containerId);

    if (!container) {
      throw new NotFoundError("Conteneur introuvable");
    }

    return FillHistoryRepository.findByContainerId(containerId);
  }
}

export default new FillHistoryService();