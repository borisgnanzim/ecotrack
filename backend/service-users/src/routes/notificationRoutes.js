const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Get authenticated user's notifications
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 message:
 *                   type: string
 *                   example: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', notificationController.getNotifications);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read (owner only)
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification id
 *     responses:
 *       200:
 *         description: Updated notification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not owner)
 *       404:
 *         description: Notification not found
 */
router.patch('/:id/read', notificationController.markAsRead);

/**
 * @openapi
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification (owner only)
 *     tags:
 *       - Notifications
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
 *         description: Deletion confirmation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification supprimée
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not owner)
 *       404:
 *         description: Notification not found
 */
router.delete('/:id', notificationController.deleteNotification);

/**
 * @openapi
 * /notifications:
 *   post:
 *     summary: Create a notification (defaults to authenticated user if no userId provided)
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationCreate'
 *     responses:
 *       201:
 *         description: Created notification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 */
router.post('/', notificationController.createNotification);

module.exports = router;