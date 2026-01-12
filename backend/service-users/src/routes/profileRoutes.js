const router = require('express').Router();
const profileController = require('../controllers/auth/profileController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * @openapi
 * /users/profile:
 *   get:
 *     summary: Retrieve authenticated user's profile
 *     description: Returns the profile information of the currently authenticated user.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "64f1c2a9b8d2e1a3c4f5d678"
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *                 username:
 *                   type: string
 *                   example: "john_doe"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-10T12:45:32.000Z"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */

router.get('/', profileController.getProfile);

/**
 * @openapi
 * /users/profile:
 *   put:
 *     summary: Update authenticated user's profile
 *     description: Allows the authenticated user to update their profile information.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "new_username"
 *               email:
 *                 type: string
 *                 example: "newemail@example.com"
 *               avatar:
 *                 type: string
 *                 example: "https://example.com/avatar.png"
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "64f1c2a9b8d2e1a3c4f5d678"
 *                     username:
 *                       type: string
 *                       example: "new_username"
 *                     email:
 *                       type: string
 *                       example: "newemail@example.com"
 *                     avatar:
 *                       type: string
 *                       example: "https://example.com/avatar.png"
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */

router.put('/', profileController.updateProfile);

module.exports = router;
