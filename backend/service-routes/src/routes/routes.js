const express = require("express");
const router = express.Router();
const controller = require("../controllers/route.controller");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validate.middleware");
const { CreateRouteDto, UpdateRouteDto, AssignAgentDto } = require("../dtos/route.dto");
const { WRITE_ROLES } = require("../constants/route.constants");

/**
 * @swagger
 * tags:
 *   name: Routes
 *   description: Gestion des routes de collecte
 */

/**
 * @swagger
 * /routes:
 *   get:
 *     summary: Lister toutes les routes
 *     tags: [Routes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des routes avec leurs étapes et agents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Route'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
router.get("/", authMiddleware, controller.getRoutes);

/**
 * @swagger
 * /routes/agent/{agentId}:
 *   get:
 *     summary: Routes d'un agent
 *     description: Retourne toutes les routes assignées à un agent spécifique.
 *     tags: [Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID de l'agent
 *     responses:
 *       200:
 *         description: Liste des routes de l'agent
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Route'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/agent/:agentId", authMiddleware, controller.getAgentRoutes);

/**
 * @swagger
 * /routes/{id}:
 *   get:
 *     summary: Détail d'une route
 *     tags: [Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID de la route
 *     responses:
 *       200:
 *         description: Route trouvée avec ses étapes et son agent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       404:
 *         description: Route non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 */
router.get("/:id", authMiddleware, controller.getRoute);

/**
 * @swagger
 * /routes/{id}/map:
 *   get:
 *     summary: Carte GeoJSON de la route
 *     description: |
 *       Retourne un GeoJSON FeatureCollection contenant :
 *       - Un `Point` par étape (conteneur avec coordonnées)
 *       - Un `LineString` reliant toutes les étapes dans l'ordre
 *     tags: [Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: GeoJSON de la route
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeoJSON'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       404:
 *         description: Route non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 */
router.get("/:id/map", authMiddleware, controller.getRouteMap);

/**
 * @swagger
 * /routes:
 *   post:
 *     summary: Créer une route
 *     tags: [Routes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRouteBody'
 *           example:
 *             date: "2026-07-15"
 *             status: "planned"
 *             agentId: null
 *             containerIds: []
 *     responses:
 *       201:
 *         description: Route créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       400:
 *         description: Champ date manquant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Le champ date est requis"
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       403:
 *         description: Rôle insuffisant (admin ou manager requis)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error403'
 */
router.post("/", authMiddleware, roleMiddleware(...WRITE_ROLES), validate(CreateRouteDto), controller.createRoute);

/**
 * @swagger
 * /routes/{id}:
 *   put:
 *     summary: Mettre à jour une route
 *     tags: [Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRouteBody'
 *           example:
 *             status: "in_progress"
 *             totalDistance: 22.5
 *     responses:
 *       200:
 *         description: Route mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       400:
 *         description: Aucun champ à mettre à jour
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       403:
 *         description: Rôle insuffisant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error403'
 *       404:
 *         description: Route non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 */
router.put("/:id", authMiddleware, roleMiddleware(...WRITE_ROLES), validate(UpdateRouteDto), controller.updateRoute);

/**
 * @swagger
 * /routes/{id}:
 *   delete:
 *     summary: Supprimer une route
 *     tags: [Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Route supprimée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Route supprimée"
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       403:
 *         description: Rôle insuffisant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error403'
 *       404:
 *         description: Route non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 */
router.delete("/:id", authMiddleware, roleMiddleware(...WRITE_ROLES), controller.deleteRoute);

/**
 * @swagger
 * /routes/{id}/assign:
 *   put:
 *     summary: Assigner un agent à une route
 *     tags: [Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignAgentBody'
 *           example:
 *             agentId: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Agent assigné
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       403:
 *         description: Rôle insuffisant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error403'
 *       404:
 *         description: Route non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 */
router.put("/:id/assign", authMiddleware, roleMiddleware(...WRITE_ROLES), validate(AssignAgentDto), controller.assignAgent);

/**
 * @swagger
 * /routes/{id}/optimize:
 *   post:
 *     summary: Optimiser une route (TSP)
 *     description: |
 *       Optimise l'ordre des étapes via les algorithmes **Nearest Neighbor** + **2-opt**.
 *
 *       Ajoute automatiquement les conteneurs critiques (niveau de remplissage > 80%)
 *       qui ne sont pas encore dans la route.
 *
 *       Met à jour les étapes, la distance totale et le temps estimé.
 *     tags: [Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Route optimisée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OptimizeResult'
 *       400:
 *         description: Pas assez de conteneurs pour optimiser
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       403:
 *         description: Rôle insuffisant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error403'
 *       404:
 *         description: Route non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 */
router.post("/:id/optimize", authMiddleware, roleMiddleware(...WRITE_ROLES), controller.optimizeRoute);

/**
 * @swagger
 * /routes/{id}/validate:
 *   post:
 *     summary: Valider une route
 *     description: |
 *       Vérifie les règles métier avant de démarrer une collecte :
 *       - La route a au moins une étape
 *       - Tous les conteneurs ont des coordonnées GPS valides
 *       - Le temps estimé ne dépasse pas 8 heures
 *       - L'heure de fin est cohérente avec le temps estimé
 *     tags: [Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Résultat de la validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationResult'
 *             example:
 *               route_id: "550e8400-e29b-41d4-a716-446655440000"
 *               is_valid: false
 *               validations:
 *                 - type: error
 *                   message: "La route n'a pas d'étapes définies"
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error401'
 *       403:
 *         description: Rôle insuffisant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error403'
 *       404:
 *         description: Route non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 */
router.post("/:id/validate", authMiddleware, roleMiddleware(...WRITE_ROLES), controller.validateRoute);

/**
 * @swagger
 * /routes/{id}/export:
 *   get:
 *     summary: Télécharger la feuille de route en PDF
 *     description: Génère et retourne un PDF avec l'itinéraire complet, la liste des conteneurs et les heures estimées.
 *     tags: [Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Fichier PDF de la feuille de route
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Route non trouvée
 */
router.get("/:id/export", authMiddleware, controller.exportPDF);

/**
 * @swagger
 * /routes/{id}/send:
 *   post:
 *     summary: Envoyer la feuille de route par email à l'agent
 *     description: Génère le PDF et l'envoie par email à l'agent assigné à la route.
 *     tags: [Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Email envoyé ou rapport d'état
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Feuille de route générée"
 *                 email:
 *                   type: object
 *                   properties:
 *                     sent:
 *                       type: boolean
 *                     to:
 *                       type: string
 *                     reason:
 *                       type: string
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Route non trouvée
 */
router.post("/:id/send", authMiddleware, roleMiddleware(...WRITE_ROLES), controller.exportAndEmail);

module.exports = router;
