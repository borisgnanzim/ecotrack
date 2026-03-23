const { createNotificationSchema, validateWithZod, ValidationError } = require('../dto');
const notificationService = require('../services/notificationService');
const authService = require('../services/authService');

/**
 * Récupérer toutes les notifications de l'utilisateur connecté
 * GET /notifications
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const error = new ValidationError({ token: 'Token requis' });
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    const notifications = await notificationService.getNotifications(decoded.id);
    
    res.status(200).json({
      success: true,
      message: 'Notifications récupérées avec succès',
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer les notifications de l'utilisateur connecté avec pagination
 * GET /notifications?page=1&limit=10
 */

exports.getNotificationsWithPagination = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const error = new ValidationError({ token: 'Token requis' });
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await notificationService.getNotifications(decoded.id, { page, limit });
    
    res.status(200).json({
      success: true,
      message: 'Notifications récupérées avec succès',
      ...result
    });
  } catch (err) {
    next(err);
  }
};


/**
 * Marquer une notification comme lue
 * PUT /notifications/:id/read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const error = new ValidationError({ token: 'Token requis' });
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    const updated = await notificationService.markAsRead(req.params.id, decoded.id);
    
    res.status(200).json({
      success: true,
      message: 'Notification marquée comme lue',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Supprimer une notification
 * DELETE /notifications/:id
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const error = new ValidationError({ token: 'Token requis' });
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    const result = await notificationService.deleteNotification(req.params.id, decoded.id);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Créer une notification
 * POST /notifications
 */
exports.createNotification = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const error = new ValidationError({ token: 'Token requis' });
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    // Valider les données avec Zod
    const validatedData = validateWithZod(createNotificationSchema, req.body);

    // Si pas d'userId fourni, utiliser l'utilisateur connecté
    const notificationData = { ...validatedData };
    if (!notificationData.userId) {
      notificationData.userId = decoded.id;
    }

    const created = await notificationService.createNotification(notificationData);

    res.status(201).json({
      success: true,
      message: 'Notification créée avec succès',
      data: created
    });
  } catch (err) {
    next(err);
  }
};