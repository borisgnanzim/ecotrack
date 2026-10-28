const { recordActionAndUpdatePoints } = require('../services/gamificationService');
const { prisma } = require('../config/postgres');

class SignalementController {
  static async reportSignalement(req, res, next) {
    try {
      const { userId, actionType = 'report_container', metadata } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const result = await recordActionAndUpdatePoints({ userId, actionType, metadata });

      // TODO: send notification for earned badges via notification service

      res.json({ ok: true, result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Récupère tous les signalements (actions de type 'report_container').
   * TODO: Ajouter une pagination.
   */
  static async getAllSignalements(req, res, next) {
    try {
      const signalements = await prisma.userAction.findMany({
        where: {
          actionType: 'report_container',
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
      res.json({ count: signalements.length, signalements });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Récupère les signalements de l'utilisateur authentifié.
   * NOTE: Suppose que l'ID utilisateur est dans `req.user.id` (via middleware d'authentification).
   */
  static async getMySignalements(req, res, next) {
    try {
      // Note: L'ID de l'utilisateur devrait provenir du token JWT, injecté par un middleware d'authentification.
      // Pour l'exemple, nous le prenons des paramètres, mais en production, ce serait `req.user.id`.
      const { userId } = req.params; // ou req.user.id;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
      }

      const signalements = await prisma.userAction.findMany({
        where: {
          userId: userId,
          actionType: 'report_container',
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
      res.json({ count: signalements.length, signalements });
    } catch (err) {
      next(err);
    }
  }

  static async getSignalementById(req, res, next) {
    try {
      const { id } = req.params;
      const signalement = await prisma.userAction.findUnique({ where: { id } });
      res.json(signalement);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SignalementController;
