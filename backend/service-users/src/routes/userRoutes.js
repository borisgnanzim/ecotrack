const router = require('express').Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Crée un nouvel utilisateur avec un ou plusieurs rôles (admin seulement)
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               roleNames:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 */
router.post('/', userController.createUser);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Récupère la liste des utilisateurs
 *     tags:
 *       - Utilisateurs
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */

router.get('/', userController.getAllUsers);

/**
 * @openapi
 * /users/with-pagination:
 *   get:
 *     summary: Récupère la liste des utilisateurs avec pagination
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page par défaut 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'utilisateurs par page par défaut 10
 *     responses:
 *       200:
 *         description: Liste des utilisateurs avec pagination
 */
router.get('/with-pagination', userController.getAllUsersWithPagination);

/**
 * @openapi
 * /users/{id}/roles:
 *   post:
 *     summary: Ajouter un rôle à un utilisateur (admin seulement)
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rôle ajouté avec succès
 */
router.post('/:id/roles', userController.addRoleToUser);

/**
 * @openapi
 * /users/{id}/roles:
 *   put:
 *     summary: Mettre à jour les rôles d'un utilisateur (admin seulement)
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleNames:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Rôles mis à jour avec succès
 */
router.put('/:id/roles', userController.updateUserRoles);

/**
 * @openapi
 * /users/{id}/roles/{roleName}:
 *   delete:
 *     summary: Retirer un rôle d'un utilisateur (admin seulement)
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *       - in: path
 *         name: roleName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom du rôle à retirer
 *     responses:
 *       200:
 *         description: Rôle retiré avec succès
 */
router.delete('/:id/roles/:roleName', userController.removeRoleFromUser);

/**
 * @openapi
 * /users/role/{roleName}:
 *   get:
 *     summary: Récupère les utilisateurs par rôle
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom du rôle
 *     responses:
 *       200:
 *         description: Liste des utilisateurs par rôle
 */
router.get('/role/:roleName', userController.getUsersByRole);

/**
 * @openapi
 * /users/{id}/roles:
 *   get:
 *     summary: Récupère les rôles d'un utilisateur (admin seulement)
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des rôles de l'utilisateur
 */
router.get('/:id/roles', userController.getUserRoles);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Récupère un utilisateur par son ID
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 */

router.get('/:id', userController.getUserById);

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Met à jour un utilisateur par son ID
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 */

router.put('/:id',  userController.updateUser);

/**
 * 
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Supprime un utilisateur par son ID
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;