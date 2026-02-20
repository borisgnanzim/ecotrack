const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { ValidationError } = require('../../dto');
const profileService = require('../../services/profileService');

/**
 * Uploader un avatar pour l'utilisateur connecté
 * POST /users/profile/avatar
 */
exports.uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      const error = new ValidationError({ user: 'Utilisateur non authentifié' });
      error.statusCode = 401;
      throw error;
    }

    if (!req.file) {
      const error = new ValidationError({ file: 'Aucun fichier uploadé' });
      error.statusCode = 400;
      throw error;
    }

    const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const filename = `${userId}.webp`;
    const filepath = path.join(uploadsDir, filename);

    // Redimensionner et convertir en webp
    await sharp(req.file.buffer)
      .resize(256, 256)
      .webp({ quality: 80 })
      .toFile(filepath);

    // Mettre à jour l'avatar de l'utilisateur via le service
    const avatarUrl = `/uploads/avatars/${filename}`;
    await profileService.updateAvatar(userId, avatarUrl);

    const fullAvatarUrl = `${req.protocol}://${req.get('host')}${avatarUrl}`;

    res.status(200).json({
      success: true,
      message: 'Avatar uploadé avec succès',
      data: { avatarUrl: fullAvatarUrl }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer l'avatar d'un utilisateur
 * GET /users/avatar/:id
 */
exports.getAvatar = async (req, res, next) => {
  try {
    // Récupérer l'ID desde les params ou depuis l'utilisateur authentifié
    const userId = req.params.id || (req.user && req.user.id);
    if (!userId) {
      const error = new ValidationError({ id: 'ID utilisateur manquant' });
      error.statusCode = 400;
      throw error;
    }

    const avatarsDir = path.join(process.cwd(), 'uploads', 'avatars');
    const filename = `${userId}.webp`;
    const filepath = path.join(avatarsDir, filename);

    let fileToSend;
    if (fs.existsSync(filepath)) {
      fileToSend = filepath;
    } else {
      fileToSend = path.join(process.cwd(), 'uploads', 'defaults', 'default_avatar.svg');
    }

    // Ajouter les headers de cache et servir le fichier
    res.set('Cache-Control', 'public, max-age=86400');
    res.sendFile(fileToSend);
  } catch (err) {
    next(err);
  }
};