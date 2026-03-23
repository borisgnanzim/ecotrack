const { createUserSchema, updateUserSchema, validateWithZod } = require('../dto');
const userService = require('../services/userService');

/**
 * Récupérer tous les utilisateurs
 * GET /users
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer tous les utilisateurs avec pagination  
 * GET /users
 */
exports.getAllUsersWithPagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const result = await userService.getAllUsers({ page, limit });
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer un utilisateur par ID
 * GET /users/:id
 */
exports.getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Créer un nouvel utilisateur (Admin)
 * POST /users
 */
exports.createUser = async (req, res, next) => {
    try {
        // Valider les données avec Zod
        const validatedData = validateWithZod(createUserSchema, req.body);

        // Utiliser le service pour la logique métier
        const user = await userService.createUser(validatedData);

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Mettre à jour un utilisateur
 * PUT /users/:id
 */
exports.updateUser = async (req, res, next) => {
    try {
        // Valider les données avec Zod
        const validatedData = validateWithZod(updateUserSchema, req.body);

        // Utiliser le service pour la logique métier
        const user = await userService.updateUser(req.params.id, validatedData);

        res.status(200).json({
            success: true,
            message: 'Utilisateur mis à jour avec succès',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Supprimer un utilisateur
 * DELETE /users/:id
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const result = await userService.deleteUser(req.params.id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};


