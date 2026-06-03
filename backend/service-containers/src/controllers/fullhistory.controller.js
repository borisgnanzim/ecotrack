import FillHistoryService from '../services/fillhistory.service.js';
import { createFillHistoryDTO, ContainerIdDTO } from '../dtos/fillhistory.dto.js';

class FillHistoryController {
  async add(req, res, next) {
    try {
      const { id } = ContainerIdDTO.parse({ id: req.params.id });
      const data = createFillHistoryDTO.parse(req.body);
      const history = await FillHistoryService.addFillHistory(id, data);
      res.status(201).json(history);
    } catch (error) {
      next(error);
    }
  }

  async getByContainer(req, res, next) {
    try {
      const { id } = ContainerIdDTO.parse({ id: req.params.id });
      const history = await FillHistoryService.getFillHistory(id);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }

  async getLatest(req, res, next) {
    try {
      const { id } = ContainerIdDTO.parse({ id: req.params.id });
      const latest = await FillHistoryService.getLatestFillLevel(id);
      res.json(latest);
    } catch (error) {
      next(error);
    }
  }
}

export default new FillHistoryController();