const router = require('express').Router();
const authController = require('../controllers/auth/authController');

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authentifie un utilisateur et génère un token JWT
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRequest'
 *     responses:
 *       200:
 *         description: Utilisateur authentifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               success:
 *                 value:
 *                   token: "eyJhbGci..."
 *                   message: "Logged in successfully"
 *                   user: { id: "...", username: "alice123", role: "citizen" }
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /auth/register/citizen:
 *   post:
 *     summary: Enregistre un citoyen
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Citoyen enregistré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.post('/register/citizen', authController.registerCitizen);

module.exports = router;
