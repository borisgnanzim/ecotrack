import { Router } from 'express';
import multer from 'multer';
import zoneController from '../controllers/zone.controller.js';
import { CreateZoneDTO, UpdateZoneDTO, AssignContainersDTO } from '../dtos/zone.dto.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ── Static routes (MUST be before /:id) ─────────────────────────────────────

/**
 * @swagger
 * /zones/stats:
 *   get:
 *     summary: Statistiques globales de toutes les zones
 *     tags: [Zones]
 *     description: |
 *       Retourne un résumé agrégé :
 *       - Nombre de zones (total / actives)
 *       - Nombre total de conteneurs
 *       - Taux de remplissage moyen (pondéré)
 *       - Nombre de zones critiques (avg ≥ 80%)
 *       - Détail par zone
 *     responses:
 *       200:
 *         description: Statistiques globales
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ZoneGlobalStats'
 */
router.get('/stats', zoneController.getGlobalStats);

/**
 * @swagger
 * /zones/choropleth:
 *   get:
 *     summary: Carte choroplèthe — GeoJSON par taux de remplissage
 *     tags: [Zones]
 *     description: |
 *       Retourne un `FeatureCollection` GeoJSON où chaque zone est enrichie de :
 *       - `avgFillLevel` — taux moyen (0-100)
 *       - `fillCategory` — `low / medium / high / critical`
 *       - `containerCount`, `criticalContainers`
 *
 *       Zones sans polygone ni coordonnées GPS sont exclues du GeoJSON.
 *     responses:
 *       200:
 *         description: GeoJSON FeatureCollection choroplèthe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureCollection'
 */
router.get('/choropleth', zoneController.getChoropleth);

/**
 * @swagger
 * /zones/export/geojson:
 *   get:
 *     summary: Exporter toutes les zones au format GeoJSON
 *     tags: [Zones - Import/Export]
 *     description: |
 *       Télécharge un fichier `zones.geojson` (GeoJSON FeatureCollection).
 *       Chaque feature inclut la géométrie polygonale et les propriétés de la zone.
 *     responses:
 *       200:
 *         description: Fichier GeoJSON
 *         content:
 *           application/geo+json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureCollection'
 */
router.get('/export/geojson', zoneController.exportGeoJSON);

/**
 * @swagger
 * /zones/import/geojson:
 *   post:
 *     summary: Importer des zones depuis GeoJSON
 *     tags: [Zones - Import/Export]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Accepte :
 *       - Un **body JSON** contenant une `FeatureCollection`
 *       - OU un **fichier `.geojson`** uploadé (multipart/form-data, champ `file`)
 *
 *       Chaque feature doit avoir en `properties` : `id` (ou au moins `name`) et `name`.
 *       Les zones existantes (même `id`) sont mises à jour.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeatureCollection'
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Résultat de l'import
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImportResult'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/import/geojson', authMiddleware, upload.single('file'), zoneController.importGeoJSON);

/**
 * @swagger
 * /zones/export/shapefile:
 *   get:
 *     summary: Exporter toutes les zones au format Shapefile (ZIP)
 *     tags: [Zones - Import/Export]
 *     description: |
 *       Télécharge un fichier ZIP contenant les fichiers Shapefile (.shp, .dbf, .prj).
 *       Compatible avec QGIS, ArcGIS et tout SIG standard.
 *     responses:
 *       200:
 *         description: Archive ZIP contenant le shapefile
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export/shapefile', zoneController.exportShapefile);

/**
 * @swagger
 * /zones/import/shapefile:
 *   post:
 *     summary: Importer des zones depuis un Shapefile (ZIP)
 *     tags: [Zones - Import/Export]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Accepte un fichier ZIP contenant au minimum un `.shp` (et optionnellement `.dbf`).
 *       Les attributs du DBF sont lus comme propriétés de zone (`name`, `city`, `district`, etc.).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archive ZIP contenant le shapefile
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: Résultat de l'import
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImportResult'
 *       400:
 *         description: Fichier manquant ou format invalide
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/import/shapefile', authMiddleware, upload.single('file'), zoneController.importShapefile);

// ── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /zones:
 *   get:
 *     summary: Lister toutes les zones
 *     tags: [Zones]
 *     description: |
 *       Retourne la liste de toutes les zones avec leurs statistiques agrégées
 *       (nombre de conteneurs, taux moyen de remplissage, conteneurs critiques).
 *     responses:
 *       200:
 *         description: Liste des zones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ZoneWithStats'
 */
router.get('/', zoneController.getAll);

/**
 * @swagger
 * /zones:
 *   post:
 *     summary: Créer une zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Crée une nouvelle zone géographique. L'`id` est choisi par l'appelant
 *       (ex: `"ZB12"`, `"ZONE-NORD"`).
 *
 *       Le `polygon` doit être un objet GeoJSON de type `Polygon` ou `MultiPolygon`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateZoneBody'
 *           example:
 *             id: "ZB12"
 *             name: "Zone B12 — Plateau"
 *             city: "Dakar"
 *             district: "Plateau"
 *             latitude: 14.6937
 *             longitude: -17.4441
 *             polygon:
 *               type: Polygon
 *               coordinates: [[[-17.45, 14.69], [-17.43, 14.69], [-17.43, 14.70], [-17.45, 14.70], [-17.45, 14.69]]]
 *     responses:
 *       201:
 *         description: Zone créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Zone'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: Nom de zone déjà utilisé
 */
router.post('/', authMiddleware, validate(CreateZoneDTO), zoneController.create);

/**
 * @swagger
 * /zones/{id}:
 *   get:
 *     summary: Détail d'une zone
 *     tags: [Zones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: ZB12
 *     responses:
 *       200:
 *         description: Zone avec conteneurs et statistiques
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ZoneWithStats'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', zoneController.getById);

/**
 * @swagger
 * /zones/{id}:
 *   put:
 *     summary: Mettre à jour une zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateZoneBody'
 *     responses:
 *       200:
 *         description: Zone mise à jour
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', authMiddleware, validate(UpdateZoneDTO), zoneController.update);

/**
 * @swagger
 * /zones/{id}:
 *   delete:
 *     summary: Supprimer une zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Supprime la zone. Les conteneurs associés ont leur `zoneId` mis à `null` automatiquement.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Zone supprimée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', authMiddleware, zoneController.delete);

/**
 * @swagger
 * /zones/{id}/stats:
 *   get:
 *     summary: Statistiques d'une zone
 *     tags: [Zones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statistiques détaillées
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ZoneStats'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id/stats', zoneController.getZoneStats);

/**
 * @swagger
 * /zones/{id}/containers:
 *   get:
 *     summary: Conteneurs d'une zone
 *     tags: [Zones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des conteneurs de la zone
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id/containers', zoneController.getContainers);

/**
 * @swagger
 * /zones/{id}/containers/assign:
 *   patch:
 *     summary: Assigner des conteneurs à une zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               containerIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *           example:
 *             containerIds: ["550e8400-e29b-41d4-a716-446655440000"]
 *     responses:
 *       200:
 *         description: Conteneurs assignés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 zoneId:
 *                   type: string
 *                 assigned:
 *                   type: integer
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/:id/containers/assign', authMiddleware, validate(AssignContainersDTO), zoneController.assignContainers);

/**
 * @swagger
 * /zones/{id}/containers/remove:
 *   patch:
 *     summary: Retirer des conteneurs d'une zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               containerIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Conteneurs retirés (zoneId mis à null)
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/:id/containers/remove', authMiddleware, validate(AssignContainersDTO), zoneController.removeContainers);

export default router;
