// src/controllers/container.controller.js
import ContainerService from '../services/container.service.js';
import FillHistoryService from '../services/fillhistory.service.js';
import { CreateContainerDTO, UpdateContainerDTO,ContainerIdDTO } from '../dtos/container.dto.js';

class ContainerController {
  async getById(req, res, next) {
    try {
      const {id} = ContainerIdDTO.parse({id: +req.params.id});
      const container = await ContainerService.getContainerById(id);
      res.json(container);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const containers = await ContainerService.getAllContainers();
      res.json(containers);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const data= CreateContainerDTO.parse(req.body);
      const container = await ContainerService.createContainer(data);
      res.status(201).json(container);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const {id} = ContainerIdDTO.parse({id: +req.params.id});
      const data= UpdateContainerDTO.parse(req.body);
      const container = await ContainerService.updateContainer(id, data);
      res.json(container);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await ContainerService.deleteContainer(+req.params.id);
      res.json({ message: 'Conteneur supprimé' });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await ContainerService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getFillHistory(req, res, next) {
    try {
      const history = await FillHistoryService.getFillHistory(+req.params.id);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }

  async addFillHistory(req, res, next) {
    try {
      const newEntry = await FillHistoryService.addFillHistory(+req.params.id, req.body);
      res.status(201).json(newEntry);
    } catch (error) {
      next(error);
    }
  }

  async getNearbyContainers(req, res, next) {
    try {
      const containers = await ContainerService.getNearbyContainers(req.query);
      res.json(containers);
    } catch (error) {
      next(error);
    }
  }

  async uploadPhoto(req, res, next) {
    try {
      const result = await ContainerService.uploadPhoto(+req.params.id, req.file);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const filters = {
        type_Dechet: req.query.type_Dechet,
        id_Zone: req.query.id_Zone,
        Statut: req.query.Statut,
        code_conteneur: req.query.code_conteneur ? parseInt(req.query.code_conteneur) : undefined,
      };
      // Supprimer les filtres undefined
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const results = await ContainerService.searchContainers(filters);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }
}

export default new ContainerController();