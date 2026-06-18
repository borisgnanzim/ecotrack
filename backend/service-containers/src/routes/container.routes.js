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

// Mitigation: limit non-file form fields to mitigate deep-nesting multipart attacks
const upload = multer({ storage, limits: { fields: 50, fileSize: 5 * 1024 * 1024 } });

/* =========================
   Routes Containers
========================= */

/**
 * @swagger
 * tags:
 *   - name: Containers
 *     description: Gestion CRUD des conteneurs
 *   - name: Search & Stats
 *     description: Recherche, géolocalisation et statistiques
 *   - name: Fill History
 *     description: Historique de remplissage
 *   - name: Photos
 *     description: Upload et gestion des photos
 */

router.get('/', containerController.getAll);

/**
 * @swagger
 * /containers:
 *   get:
 *     summary: Lister tous les conteneurs
 *     tags: [Containers]
 *     description: |
 *       Récupère la liste complète de tous les conteneurs avec pagination.
 *       
 *       **Authentification** : Non requise
 *       **Rate Limit** : 100 requêtes/minute
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: ✅ Liste des conteneurs récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conteneur'
 *             example:
 *               - id: "550e8400-e29b-41d4-a716-446655440000"
 *                 type: plastique
 *                 status: active
 *                 zoneId: "123e4567-e89b-12d3-a456-426614174000"
 *                 capacity: 100
 *                 code: 1001
 *                 fillLevel: 42
 *                 latitude: 14.6937
 *                 longitude: -16.4441
 *                 createdAt: "2026-03-01T08:00:00Z"
 *       500:
 *         description: ❌ Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Créer un nouveau conteneur
 *     tags: [Containers]
 *     description: |
 *       Crée un conteneur de déchets.
 *       
 *       **Authentification** : JWT requise
 *       **Rôles autorisés** : admin, moderator
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConteneurCreate'
 *           example:
 *             type: plastique
 *             zoneId: "123e4567-e89b-12d3-a456-426614174000"
 *             capacity: 100
 *             code: 1005
 *             latitude: 14.6937
 *             longitude: -16.4441
 *     responses:
 *       201:
 *         description: ✅ Conteneur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conteneur'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: ❌ code existe déjà
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/',
  (req, res, next) => {
    next();
  },
  authMiddleware,
  (req, res, next) => {
    next();
  },
  validate(CreateContainerDTO),
  (req, res, next) => {
    next();
  },
  containerController.create
);

/**
 * @swagger
 * /containers/stats:
 *   get:
 *     summary: Statistiques globales
 *     tags: [Search & Stats]
 *     description: |
 *       Récupère les statistiques d'agrégation sur tous les conteneurs.
 *       
 *       Inclut :
 *       - Total conteneurs
 *       - Distribution par statut
 *       - Distribution par type de déchet
 *       - Niveau moyen de remplissage
 *       - Distribution par zone
 *       
 *       **Authentification** : Non requise
 *     responses:
 *       200:
 *         description: ✅ Statistiques récupérées
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Statistics'
 */
router.get('/stats', containerController.getStats);

/**
 * @swagger
 * /containers/search:
 *   get:
 *     summary: Recherche flexible avec filtres
 *     tags: [Search & Stats]
 *     description: |
 *       Effectue une recherche sur les conteneurs avec filtres combinables.
 *       
 *       Exemples :
 *       - \`/search?type=plastique\`
 *       - \`/search?zone=zoneB&status=plein\`
 *       - \`/search?fill_min=50&fill_max=80\`
 *       
 *       **Authentification** : Non requise
 *     parameters:
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [plastique, papier, verre, compost]
 *         description: Filtrer par type de déchet
 *       - name: zone
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrer par zone
 *         example: zoneB
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [normal, plein, en_maintenance, desactive]
 *         description: Filtrer par statut
 *       - name: fill_min
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         description: Niveau de remplissage minimum (%)
 *       - name: fill_max
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         description: Niveau de remplissage maximum (%)
 *     responses:
 *       200:
 *         description: ✅ Résultats de la recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conteneur'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/search', containerController.search);

/**
 * @swagger
 * /containers/nearby:
 *   get:
 *     summary: Conteneurs à proximité (géolocalisation)
 *     tags: [Search & Stats]
 *     description: |
 *       Recherche les conteneurs situés à proximité d'une coordonnée GPS.
 *       
 *       Utilise l'extension PostgreSQL **earthdistance** pour calculs précis.
 *       
 *       **Authentification** : Non requise
 *     parameters:
 *       - name: lat
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude de référence
 *         example: 14.6937
 *       - name: longitude
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude de référence
 *         example: -16.4441
 *       - name: radius
 *         in: query
 *         schema:
 *           type: number
 *           default: 5
 *         description: Rayon de recherche en km
 *     responses:
 *       200:
 *         description: ✅ Conteneurs trouvés
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Conteneur'
 *                   - type: object
 *                     properties:
 *                       distance_km:
 *                         type: number
 *                         description: Distance en km
 *                         example: 0.3
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/nearby', containerController.getNearbyContainers);


/**
 * @swagger
 * /containers/{id}:
 *   get:
 *     summary: Obtenir un conteneur par ID
 *     tags: [Containers]
 *     description: |
 *       Récupère les détails complets d'un conteneur spécifique.
 *       
 *       **Authentification** : Non requise
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du conteneur
 *         example: 1
 *     responses:
 *       200:
 *         description: ✅ Conteneur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conteneur'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', containerController.getById);

/**
 * @swagger
 * /containers/{id}:
 *   put:
 *     summary: Mettre à jour un conteneur
 *     tags: [Containers]
 *     description: |
 *       Modifie les propriétés d'un conteneur existant.
 *       
 *       **Authentification** : JWT requise
 *       **Rôles autorisés** : admin, moderator
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConteneurUpdate'
 *           example:
 *             type: papier
 *             status: maintenance
 *             capacity: 120
 *     responses:
 *       200:
 *         description: ✅ Conteneur mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conteneur'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

router.put('/:id',
  (req, res, next) => {
    next();
  },
  authMiddleware,
  (req, res, next) => {
    next();
  },
  validate(UpdateContainerDTO),
  (req, res, next) => {
    next();
  },
  containerController.update
);

/**
 * @swagger
 * /containers/{id}:
 *   delete:
 *     summary: Supprimer un conteneur
 *     tags: [Containers]
 *     description: |
 *       Supprime un conteneur et son historique associé (cascade).
 *       
 *       **Authentification** : JWT requise
 *       **Rôles autorisés** : admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       204:
 *         description: ✅ Conteneur supprimé (pas de contenu)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', authMiddleware, containerController.delete);

/**
 * @swagger
 * /containers/{id}/fill-history:
 *   post:
 *     summary: Enregistrer un relevé de remplissage
 *     tags: [Fill History]
 *     description: |
 *       Ajoute un nouveau relevé de niveau de remplissage pour un conteneur.
 *       
 *       **Authentification** : JWT requise
 *       **Rôles autorisés** : admin, technician, citizen
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FillHistoryCreate'
 *           example:
 *             niveau: 75
 *     responses:
 *       201:
 *         description: ✅ Relevé enregistré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FillHistory'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/fill-history', authMiddleware, validate(createFillHistoryDTO), containerController.addFillHistory);

/**
 * @swagger
 * /containers/{id}/fill-history:
 *   get:
 *     summary: Récupérer l'historique de remplissage
 *     tags: [Fill History]
 *     description: |
 *       Récupère l'historique complet des relevés de remplissage pour un conteneur.
 *       
 *       **Authentification** : Non requise (voir note sécurité)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - name: days
 *         in: query
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Nombre de jours à inclure (rétroactivement)
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 100
 *           maximum: 1000
 *         description: Nombre maximum de relevés à retourner
 *     responses:
 *       200:
 *         description: ✅ Historique récupéré
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FillHistory'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id/fill-history', containerController.getFillHistory);

/**
 * @swagger
 * /containers/{id}/photo:
 *   post:
 *     summary: Uploader une photo de conteneur
 *     tags: [Photos]
 *     description: |
 *       Permet l'upload d'une image de conteneur (JPG, PNG, WebP).
 *       
 *       L'image est redimensionnée et optimisée au format WebP.
 *       La taille maximale est contrôlée par \`MAX_PHOTO_SIZE_MB\` (.env).
 *       
 *       **Authentification** : JWT requise
 *       **Rôles autorisés** : admin, moderator
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Image du conteneur (JPG, PNG, WebP)
 *             required:
 *               - photo
 *     responses:
 *       200:
 *         description: ✅ Photo uploadée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 photo_url:
 *                   type: string
 *                   description: URL relative de la photo uploadée
 *                   example: /uploads/conteneur-1709955930123.webp
 *                 conteneurId:
 *                   type: integer
 *                   example: 1
 *                 uploadedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: ❌ Fichier manquant ou format invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       413:
 *         description: ❌ Fichier trop volumineux
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:id/photo',
  authMiddleware,
  upload.single('photo'),
  containerController.uploadPhoto
);

export default router;
