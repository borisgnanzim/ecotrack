const { updateProfileSchema, changePasswordSchema, validateWithZod, ValidationError } = require('../../dto');
const profileService = require('../../services/profileService');
const authService = require('../../services/authService');

/**
 * Récupérer le profil de l'utilisateur connecté
 * GET /profile
 */
exports.getProfile = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            const error = new ValidationError({ token: 'Token requis' });
            error.statusCode = 401;
            throw error;
        }

        const token = authHeader.split(" ")[1];
        const decoder = authService.verifyToken(token);

        // Utiliser le service pour récupérer le profil
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const profileData = await profileService.getProfile(decoder.id, baseUrl);

        res.status(200).json({
            success: true,
            message: 'Profil récupéré avec succès',
            data: profileData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Mettre à jour le mot de passe de l'utilisateur connecté
 * PUT /profile/password
 */
exports.changePassword = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            const error = new ValidationError({ token: 'Token requis' });
            error.statusCode = 401;
            throw error;
        }

        const token = authHeader.split(" ")[1];
        const decoder = authService.verifyToken(token);
        const userId = decoder.id;

        // Valider les données avec Zod
        const validatedData = validateWithZod(changePasswordSchema, req.body);
        const { oldPassword, newPassword } = validatedData;

        // Utiliser le service pour la logique métier
        await authService.changePassword(userId, oldPassword, newPassword);

        res.status(200).json({ success: true, message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
        next(error);
    }
};

/**
 * Mettre à jour le profil de l'utilisateur connecté
 * PUT /profile
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            const error = new ValidationError({ token: 'Token requis' });
            error.statusCode = 401;
            throw error;
        }

        const token = authHeader.split(" ")[1];
        const decoder = authService.verifyToken(token);

        // Valider les données avec Zod
        const validatedData = validateWithZod(updateProfileSchema, req.body);

        // Utiliser le service pour la logique métier
        const updatedUser = await profileService.updateProfile(decoder.id, validatedData);

        res.status(200).json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};