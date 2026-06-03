import ContainerService from '../services/container.service.js';
import FillHistoryService from '../services/fillhistory.service.js';
import { CreateContainerDTO, UpdateContainerDTO, ContainerIdDTO } from '../dtos/container.dto.js';

class ContainerController {
  async getById(req, res, next) {
    try {
      const { id } = ContainerIdDTO.parse({ id: req.params.id });
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
      const data = CreateContainerDTO.parse(req.body);
      const container = await ContainerService.createContainer(data);
      res.status(201).json(container);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = ContainerIdDTO.parse({ id: req.params.id });
      const data = UpdateContainerDTO.parse(req.body);
      const container = await ContainerService.updateContainer(id, data);
      res.json(container);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = ContainerIdDTO.parse({ id: req.params.id });
      await ContainerService.deleteContainer(id);
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
      const { id } = ContainerIdDTO.parse({ id: req.params.id });
      const history = await FillHistoryService.getFillHistory(id);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }

  async addFillHistory(req, res, next) {
    try {
      const { id } = ContainerIdDTO.parse({ id: req.params.id });
      const newEntry = await FillHistoryService.addFillHistory(id, req.body);
      res.status(201).json(newEntry);
    } catch (error) {
      next(error);
    }
  }

  async getByZone(req, res, next) {
    try {
      const { zoneId } = req.query;
      if (!zoneId) {
        return res.status(400).json({ error: 'zoneId query param required' });
      }
      const containers = await ContainerService.getContainersByZone(zoneId);
      res.json(containers);
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const filters = {
        type: req.query.type,
        zoneId: req.query.zoneId,
        status: req.query.status,
        code: req.query.code ? parseInt(req.query.code) : undefined,
      };
      // Supprimer les filtres undefined
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const results = await ContainerService.searchContainers(filters);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  async getNearbyContainers(req, res, next) {
    try {
      const { latitude, longitude, radius } = req.query;
      if (!latitude || !longitude || !radius) {
        return res.status(400).json({ error: 'latitude, longitude, and radius required' });
      }
      // TODO: Implémenter la recherche de proximité avec PostGIS
      res.json({ message: 'Geolocation search not yet implemented' });
    } catch (error) {
      next(error);
    }
  }

  async uploadPhoto(req, res, next) {
    try {
      const { id } = ContainerIdDTO.parse({ id: req.params.id });
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }
      // TODO: Implémenter le traitement de la photo
      const photoUrl = `/uploads/${req.file.filename}`;
      const container = await ContainerService.updateContainer(id, { photoUrl });
      res.json(container);
    } catch (error) {
      next(error);
    }
  }
}

export default new ContainerController();