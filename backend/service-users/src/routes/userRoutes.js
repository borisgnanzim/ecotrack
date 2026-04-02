const router = require('express').Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

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
 * /users/{id}:
 *  get:    
 *    summary: Récupère un utilisateur par son ID
 *    tags:
 *      - Utilisateurs
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Utilisateur trouvé
 */

router.get('/:id', userController.getUserById);

/**
 * @openapi
 * /users/{id}:
 *  put: 
 *      summary: Met à jour un utilisateur par son ID
 *      tags:
 *        - Utilisateurs
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Utilisateur mis à jour  
 */

router.put('/:id',  userController.updateUser);

/**
 * 
 * @openapi
 * /users/{id}:
 *  delete: 
 *      summary: Supprime un utilisateur par son ID
 *      tags:
 *        - Utilisateurs
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Utilisateur supprimé
 */
router.delete('/:id', userController.deleteUser);

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


module.exports = router;