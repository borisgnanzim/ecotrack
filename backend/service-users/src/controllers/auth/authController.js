const { loginSchema, registerSchema, validateWithZod } = require('../../dto');
const authService = require('../../services/authService');
const notificationService = require('../../services/notificationService');
const User = require('../../models/User');

/**
 * Authentifier un utilisateur
 * POST /auth/login
 */
exports.login = async (req, res, next) => {
    try {
        // Valider les données avec Zod
        const validatedData = validateWithZod(loginSchema, req.body);

        // Utiliser le service pour la logique métier
        const result = await authService.login(validatedData.email, validatedData.password);

        res.status(200).json({
            success: true,
            message: 'Authentification réussie',
            token: result.token,
            user: result.user,
            roles: result.roles
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Enregistrer un nouvel utilisateur (citoyen)
 * POST /auth/register
 */
exports.registerCitizen = async (req, res, next) => {
    try {
        // Valider les données avec Zod
        const validatedData = validateWithZod(registerSchema, req.body);

        // Utiliser le service pour la logique métier
        const result = await authService.registerCitizen(
            validatedData.username,
            validatedData.email,
            validatedData.password
        );

        // Envoyer une notification de bienvenue (asynchrone)
        notificationService.sendWelcomeNotification(result.user)
            .catch(err => console.error('Notification échouée:', err.message || err));

        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            token: result.token,
            user: result.user,
            roles: result.roles
        });
    } catch (error) {
        next(error);
    }
};