const { GetProfileDTO, UpdateProfileDTO, ValidationError } = require('../../dto');
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

        // Valider les données avec le DTO
        const updateProfileDTO = new UpdateProfileDTO(req.body);
        updateProfileDTO.validate();

        // Utiliser le service pour la logique métier
        const updatedUser = await profileService.updateProfile(decoder.id, updateProfileDTO.toJSON());

        res.status(200).json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};