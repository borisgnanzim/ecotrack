const router = require('express').Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

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

module.exports = router;