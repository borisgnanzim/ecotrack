// src/routes/container.routes.js
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import containerController from '../controllers/container.controller.js';
import express from 'express';
import { CreateContainerDTO, UpdateContainerDTO } from '../dtos/container.dto.js';
import { createFillHistoryDTO } from '../dtos/fillhistory.dto.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();


/* =========================
   Multer (upload photo)
========================= */
const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    cb(null, `conteneur-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

/* =========================
   Routes Containers
========================= */

/**
 * @swagger
 * tags:
 *   name: Containers
 *   description: Gestion des conteneurs
 */


// CRUD
/**
 * @swagger
 * /containers:
 *   get:
 *     summary: Lister tous les conteneurs
 *     tags: [Containers]
 *     responses:
 *       200:
 *         description: Liste des conteneurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conteneur'
 */
router.get('/', containerController.getAll);

/**
 * @swagger
 * /containers:
 *   post:
 *     summary: Créer un conteneur (auth requis)
 *     tags: [Containers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConteneurCreate'
 *     responses:
 *       201:
 *         description: Conteneur créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conteneur'
 */
router.post('/', authMiddleware, validate(CreateContainerDTO), containerController.create);
router.get('/stats', containerController.getStats);
router.get('/search', containerController.search);
router.get('/:id', containerController.getById);
router.put('/:id', authMiddleware, validate(UpdateContainerDTO), containerController.update);
router.delete('/:id', authMiddleware, containerController.delete);

// Historique de remplissage
router.post('/:id/fill-history', authMiddleware, validate(createFillHistoryDTO), containerController.addFillHistory);
router.get('/:id/fill-history', containerController.getFillHistory);

// Photo
router.post(
  '/:id/photo',
  authMiddleware,
  upload.single('photo'),
  containerController.uploadPhoto
);

export default router;
