// src/routes/proxy.routes.js
/**
 * Routes proxy vers les microservices
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();
const PROXY_CONFIG = require('../config/proxy.config');
const auth = require('../middlewares/auth.middleware');


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authentifier un utilisateur
 *     description: Permet à un utilisateur de se connecter en fournissant son email et mot de passe. Retourne un token JWT pour les requêtes authentifiées.
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "user@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne le token JWT et les informations utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: 1
 *                 email: "user@example.com"
 *                 firstname: "John"
 *                 lastname: "Doe"
 *                 roles: ["citizen"]
 *                 createdAt: "2023-01-01T00:00:00.000Z"
 *       401:
 *         description: Identifiants incorrects ou compte non activé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid credentials"
 *               statusCode: 401
 *               timestamp: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Données d'entrée invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /auth/register:
 *   post:
 *     summary: Inscrire un nouvel utilisateur
 *     description: Crée un nouveau compte utilisateur avec les informations fournies. L'utilisateur recevra un email de confirmation.
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             email: "newuser@example.com"
 *             password: "securepassword"
 *             firstname: "Jane"
 *             lastname: "Smith"
 *     responses:
 *       201:
 *         description: Inscription réussie, retourne le token JWT et les informations utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: 2
 *                 email: "newuser@example.com"
 *                 firstname: "Jane"
 *                 lastname: "Smith"
 *                 roles: ["citizen"]
 *                 createdAt: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Données d'entrée invalides ou email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Email already exists"
 *               statusCode: 400
 *               timestamp: "2023-01-01T00:00:00.000Z"
 *       422:
 *         description: Erreur de validation des données
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.use('/auth', createProxyMiddleware({
  target: PROXY_CONFIG.users.url,
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/auth'
  },
  onError: (err, req, res) => {
    console.error('Proxy Error - Auth Service:', err);
    res.status(503).json({
      error: 'Service Users indisponible',
      statusCode: 503,
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     description: Retourne les informations du profil de l'utilisateur actuellement authentifié.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: 1
 *               email: "user@example.com"
 *               firstname: "John"
 *               lastname: "Doe"
 *               roles: ["citizen"]
 *               createdAt: "2023-01-01T00:00:00.000Z"
 *       401:
 *         description: Token JWT manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *               statusCode: 401
 *               timestamp: "2023-01-01T00:00:00.000Z"
 *
 * /users:
 *   get:
 *     summary: Récupérer la liste de tous les utilisateurs
 *     description: Retourne la liste complète des utilisateurs enregistrés dans le système. Réservé aux administrateurs.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       403:
 *         description: Permissions insuffisantes (nécessite le rôle admin)
 *
 * /users/with-pagination:
 *   get:
 *     summary: Récupérer la liste des utilisateurs avec pagination
 *     description: Retourne une liste paginée des utilisateurs. Réservé aux administrateurs.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'utilisateurs par page
 *     responses:
 *       200:
 *         description: Liste paginée des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       401:
 *         description: Token JWT manquant ou invalide
 *       403:
 *         description: Permissions insuffisantes
 *
 * /users/{id}:
 *   get:
 *     summary: Récupérer les détails d'un utilisateur par ID
 *     description: Retourne les informations détaillées d'un utilisateur spécifique. Réservé aux administrateurs.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       403:
 *         description: Permissions insuffisantes
 *       404:
 *         description: Utilisateur non trouvé
 *   put:
 *     summary: Mettre à jour un utilisateur par ID
 *     description: Modifie les informations d'un utilisateur spécifique. Réservé aux administrateurs.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Token JWT manquant ou invalide
 *       403:
 *         description: Permissions insuffisantes
 *       404:
 *         description: Utilisateur non trouvé
 *   delete:
 *     summary: Supprimer un utilisateur par ID
 *     description: Supprime un utilisateur du système. Réservé aux administrateurs.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       401:
 *         description: Token JWT manquant ou invalide
 *       403:
 *         description: Permissions insuffisantes
 *       404:
 *         description: Utilisateur non trouvé
 *
 * /users/role/{roleName}:
 *   get:
 *     summary: Récupérer les utilisateurs par rôle
 *     description: Retourne la liste des utilisateurs ayant un rôle spécifique. Réservé aux administrateurs.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleName
 *         required: true
 *         description: Nom du rôle
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des utilisateurs par rôle
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       403:
 *         description: Permissions insuffisantes
 *
 * /users/profile/avatar:
 *   post:
 *     summary: Télécharger l'avatar de l'utilisateur
 *     description: Upload une nouvelle image d'avatar pour l'utilisateur connecté.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image de l'avatar
 *     responses:
 *       200:
 *         description: Avatar téléchargé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avatarUrl:
 *                   type: string
 *                   description: URL de l'avatar
 *       400:
 *         description: Fichier invalide
 *       401:
 *         description: Token JWT manquant ou invalide
 *   get:
 *     summary: Récupérer l'avatar de l'utilisateur connecté
 *     description: Retourne l'image d'avatar de l'utilisateur actuellement authentifié.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Image de l'avatar
 *         content:
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *           image/svg+xml:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Avatar non trouvé
 *
 * /users/profile/avatar/{id}:
 *   get:
 *     summary: Récupérer l'avatar d'un utilisateur par ID
 *     description: Retourne l'image d'avatar d'un utilisateur spécifique.
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image de l'avatar
 *         content:
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *           image/svg+xml:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Avatar non trouvé
 *   put:
 *     summary: Mettre à jour le profil de l'utilisateur connecté
 *     description: Permet à l'utilisateur de modifier ses informations personnelles (prénom, nom).
 *     tags: [Utilisateurs]
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
 *                 description: Nouveau prénom
 *                 example: "Jean"
 *               lastname:
 *                 type: string
 *                 description: Nouveau nom de famille
 *                 example: "Dupont"
 *             required:
 *               - firstname
 *               - lastname
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: 1
 *               email: "user@example.com"
 *               firstname: "Jean"
 *               lastname: "Dupont"
 *               roles: ["citizen"]
 *               createdAt: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Données d'entrée invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid input data"
 *               statusCode: 400
 *               timestamp: "2023-01-01T00:00:00.000Z"
 *       401:
 *         description: Token JWT manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.use('/users', auth, createProxyMiddleware({
  target: PROXY_CONFIG.users.url,
  changeOrigin: true,
  pathRewrite: {
    '^/users': '/users'
  },
  onError: (err, req, res) => {
    console.error('Proxy Error - Users Service:', err);
    res.status(503).json({
      error: 'Service Users indisponible',
      statusCode: 503,
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Récupérer les notifications de l'utilisateur
 *     description: Retourne la liste des notifications associées à l'utilisateur connecté, triées par date de création décroissante.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *             example:
 *               - id: 1
 *                 userId: 1
 *                 title: "Bienvenue"
 *                 message: "Bienvenue sur EcoTrack !"
 *                 isRead: false
 *                 createdAt: "2023-01-01T00:00:00.000Z"
 *               - id: 2
 *                 userId: 1
 *                 title: "Maintenance"
 *                 message: "Le conteneur près de chez vous est en maintenance."
 *                 isRead: true
 *                 createdAt: "2023-01-02T00:00:00.000Z"
 *       401:
 *         description: Token JWT manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   post:
 *     summary: Créer une notification
 *     description: Crée une nouvelle notification (défaut à l'utilisateur connecté si aucun userId fourni).
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       201:
 *         description: Notification créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /notifications/{id}/read:
 *   put:
 *     summary: Marquer une notification comme lue
 *     description: Met à jour le statut d'une notification spécifique pour la marquer comme lue.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la notification à marquer comme lue
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Notification marquée comme lue avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *             example:
 *               id: 1
 *               userId: 1
 *               title: "Bienvenue"
 *               message: "Bienvenue sur EcoTrack !"
 *               isRead: true
 *               createdAt: "2023-01-01T00:00:00.000Z"
 *       401:
 *         description: Token JWT manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Notification non trouvée ou n'appartient pas à l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Notification not found"
 *               statusCode: 404
 *               timestamp: "2023-01-01T00:00:00.000Z"
 *
 * /notifications/with-pagination:
 *   get:
 *     summary: Récupérer les notifications avec pagination
 *     description: Retourne une liste paginée des notifications de l'utilisateur connecté.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre de notifications par page
 *     responses:
 *       200:
 *         description: Liste paginée des notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /notifications/{id}:
 *   delete:
 *     summary: Supprimer une notification
 *     description: Supprime une notification spécifique (propriétaire uniquement).
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la notification
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification supprimée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notification supprimée"
 *       401:
 *         description: Token JWT manquant ou invalide
 *       403:
 *         description: Non propriétaire de la notification
 *       404:
 *         description: Notification non trouvée
 */
router.use('/notifications', auth, createProxyMiddleware({
  target: PROXY_CONFIG.users.url,
  changeOrigin: true,
  pathRewrite: {
    '^/notifications': '/notifications'
  },
  onError: (err, req, res) => {
    console.error('Proxy Error - Notifications:', err);
    res.status(503).json({
      error: 'Service Notifications indisponible',
      statusCode: 503,
      timestamp: new Date().toISOString()
    });
  }
}));


/**
 * Forward vers la documentation Swagger du service Users
 * GET /docs/service-users -> http://localhost:3011/api-docs
 */
router.use(
  '/docs/service-users',
  createProxyMiddleware({
    target: PROXY_CONFIG.users.url,
    changeOrigin: true,
    /* preserve subpaths for assets */
    pathRewrite: {
      '^/*': '/api-docs/',
    },
    onError: (err, req, res) => {
      console.error('Proxy Error - Users API Docs:', err);
      res.status(503).json({
        error: 'Documentation Service Users indisponible',
        statusCode: 503,
        timestamp: new Date().toISOString(),
      });
    },
  })
);

/**
 * @swagger
 * /containers:
 *   get:
 *     summary: Récupérer la liste des conteneurs
 *     description: Retourne la liste de tous les conteneurs disponibles dans le système, avec leurs statuts et localisations.
 *     tags: [Conteneurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conteneurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Container'
 *             example:
 *               - id: 1
 *                 type_Dechet: "papier"
 *                 Statut: "vide"
 *                 latitude: 48.8566
 *                 longitude: 2.3522
 *                 capacite_i: 240
 *                 code_conteneur: "CONT001"
 *                 createdAt: "2023-01-01T00:00:00.000Z"
 *               - id: 2
 *                 type_Dechet: "verre"
 *                 Statut: "plein"
 *                 latitude: 48.8606
 *                 longitude: 2.3376
 *                 capacite_i: 120
 *                 code_conteneur: "CONT002"
 *                 createdAt: "2023-01-01T00:00:00.000Z"
 *       401:
 *         description: Token JWT manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Créer un nouveau conteneur
 *     description: Ajoute un nouveau conteneur au système avec les informations fournies.
 *     tags: [Conteneurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Container'
 *           example:
 *             type_Dechet: "compost"
 *             Statut: "vide"
 *             latitude: 48.8647
 *             longitude: 2.3490
 *             capacite_i: 360
 *             code_conteneur: "CONT003"
 *     responses:
 *       201:
 *         description: Conteneur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Container'
 *             example:
 *               id: 3
 *               type_Dechet: "compost"
 *               Statut: "vide"
 *               latitude: 48.8647
 *               longitude: 2.3490
 *               capacite_i: 360
 *               code_conteneur: "CONT003"
 *               createdAt: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Données d'entrée invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token JWT manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /containers/{id}:
 *   get:
 *     summary: Récupérer les détails d'un conteneur
 *     description: Retourne les informations détaillées d'un conteneur spécifique par son ID.
 *     tags: [Conteneurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du conteneur à récupérer
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Détails du conteneur récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Container'
 *             example:
 *               id: 1
 *               type_Dechet: "papier"
 *               Statut: "vide"
 *               latitude: 48.8566
 *               longitude: 2.3522
 *               capacite_i: 240
 *               code_conteneur: "CONT001"
 *               createdAt: "2023-01-01T00:00:00.000Z"
 *       401:
 *         description: Token JWT manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conteneur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Container not found"
 *               statusCode: 404
 *               timestamp: "2023-01-01T00:00:00.000Z"
 *
 * /containers/stats:
 *   get:
 *     summary: Récupérer les statistiques des conteneurs
 *     description: Retourne les statistiques globales des conteneurs (total, par statut, par type, etc.).
 *     tags: [Conteneurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Statistics'
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /containers/search:
 *   get:
 *     summary: Rechercher des conteneurs
 *     description: Recherche des conteneurs selon des critères spécifiques.
 *     tags: [Conteneurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conteneur'
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /containers/nearby:
 *   get:
 *     summary: Trouver les conteneurs à proximité
 *     description: Retourne les conteneurs situés à proximité d'une position donnée.
 *     tags: [Conteneurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 1000
 *         description: Rayon en mètres
 *     responses:
 *       200:
 *         description: Conteneurs à proximité
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conteneur'
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 *   put:
 *     summary: Mettre à jour un conteneur
 *     description: Modifie les informations d'un conteneur spécifique.
 *     tags: [Conteneurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du conteneur
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConteneurUpdate'
 *     responses:
 *       200:
 *         description: Conteneur mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conteneur'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Conteneur non trouvé
 *   delete:
 *     summary: Supprimer un conteneur
 *     description: Supprime un conteneur du système.
 *     tags: [Conteneurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du conteneur
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conteneur supprimé
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Conteneur non trouvé
 *
 * /containers/{id}/fill-history:
 *   get:
 *     summary: Récupérer l'historique de remplissage
 *     description: Retourne l'historique des niveaux de remplissage d'un conteneur.
 *     tags: [Conteneurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du conteneur
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historique de remplissage
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FillHistory'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Conteneur non trouvé
 *   post:
 *     summary: Ajouter un relevé de remplissage
 *     description: Enregistre un nouveau relevé de niveau de remplissage pour un conteneur.
 *     tags: [Conteneurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du conteneur
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FillHistoryCreate'
 *     responses:
 *       201:
 *         description: Relevé ajouté
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FillHistory'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Conteneur non trouvé
 *
 * /containers/{id}/photo:
 *   post:
 *     summary: Télécharger une photo du conteneur
 *     description: Upload une photo pour un conteneur spécifique.
 *     tags: [Conteneurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du conteneur
 *         schema:
 *           type: integer
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
 *                 description: Fichier image du conteneur
 *     responses:
 *       200:
 *         description: Photo téléchargée
 *       400:
 *         description: Fichier invalide
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Conteneur non trouvé
 *       413:
 *         description: Fichier trop volumineux
 */
router.use('/containers', auth, createProxyMiddleware({
  target: PROXY_CONFIG.containers.url,
  changeOrigin: true,
  pathRewrite: {
    '^/containers': '/containers'
  },
  onError: (err, req, res) => {
    console.error('Proxy Error - Containers Service:', err);
    res.status(503).json({
      error: 'Service Containers indisponible',
      statusCode: 503,
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * @swagger
 * /routes:
 *   get:
 *     summary: Récupérer la liste des routes
 *     description: Retourne la liste de toutes les routes de collecte définies dans le système.
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des routes récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Route'
 *             example:
 *               - id: 1
 *                 name: "Route Centre-Ville"
 *                 description: "Collecte des déchets dans le centre-ville"
 *                 waypoints:
 *                   - latitude: 48.8566
 *                     longitude: 2.3522
 *                   - latitude: 48.8606
 *                     longitude: 2.3376
 *                 createdAt: "2023-01-01T00:00:00.000Z"
 *               - id: 2
 *                 name: "Route Périphérique"
 *                 description: "Collecte le long du périphérique"
 *                 waypoints:
 *                   - latitude: 48.8647
 *                     longitude: 2.3490
 *                   - latitude: 48.8738
 *                     longitude: 2.2950
 *                 createdAt: "2023-01-01T00:00:00.000Z"
 *       401:
 *         description: Token JWT manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   post:
 *     summary: Créer une nouvelle route
 *     description: Ajoute une nouvelle route de collecte au système.
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Route'
 *     responses:
 *       201:
 *         description: Route créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /routes/{id}:
 *   get:
 *     summary: Récupérer les détails d'une route
 *     description: Retourne les informations détaillées d'une route spécifique.
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la route
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de la route
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Route non trouvée
 *   put:
 *     summary: Mettre à jour une route
 *     description: Modifie les informations d'une route spécifique.
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la route
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Route'
 *     responses:
 *       200:
 *         description: Route mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Route non trouvée
 *   delete:
 *     summary: Supprimer une route
 *     description: Supprime une route du système.
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la route
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Route supprimée
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Route non trouvée
 *
 * /routes/{id}/optimize:
 *   post:
 *     summary: Optimiser une route
 *     description: Lance l'optimisation d'une route pour améliorer l'efficacité de collecte.
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la route
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Route optimisée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Route non trouvée
 *
 * /routes/{id}/assign:
 *   put:
 *     summary: Assigner un agent à une route
 *     description: Assigne un agent spécifique à une route de collecte.
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la route
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agentId:
 *                 type: integer
 *                 description: ID de l'agent
 *     responses:
 *       200:
 *         description: Agent assigné
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Route ou agent non trouvé
 *
 * /routes/agent/{agentId}:
 *   get:
 *     summary: Récupérer les routes d'un agent
 *     description: Retourne la liste des routes assignées à un agent spécifique.
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         description: ID de l'agent
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Routes de l'agent
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Route'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Agent non trouvé ou pas de routes assignées
 *
 */
 
router.use('/routes', auth, createProxyMiddleware({
  target: PROXY_CONFIG.routes.url,
  changeOrigin: true,
  pathRewrite: {
    '^/routes': '/routes'
  },
  onError: (err, req, res) => {
    console.error('Proxy Error - Routes Service:', err);
    res.status(503).json({
      error: 'Service Routes indisponible',
      statusCode: 503,
      timestamp: new Date().toISOString()
    });
  }
}));

// Service Analytics

/**
 * @swagger
 * /analytics:
 *   get:
 *     summary: Récupérer les rapports d'analyses
 *     description: Retourne la liste des rapports d'analyses disponibles, incluant des statistiques sur la collecte des déchets, l'utilisation des conteneurs, etc.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rapports d'analyses récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AnalyticsReport'
 *             example:
 *               - id: 1
 *                 title: "Rapport Mensuel - Janvier 2023"
 *                 data:
 *                   totalContainers: 150
 *                   filledContainers: 45
 *                   collectionEfficiency: 85.5
 *                 generatedAt: "2023-02-01T00:00:00.000Z"
 *               - id: 2
 *                 title: "Analyse des Types de Déchets"
 *                 data:
 *                   paper: 30
 *                   glass: 25
 *                   compost: 20
 *                   plastic: 15
 *                 generatedAt: "2023-02-15T00:00:00.000Z"
 *       401:
 *         description: Token JWT manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /analytics/anomalies:
 *   get:
 *     summary: Lister les anomalies
 *     description: Retourne la liste de toutes les anomalies détectées.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des anomalies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Anomaly'
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/anomalies/{id}:
 *   get:
 *     summary: Récupérer une anomalie
 *     description: Retourne les détails d'une anomalie spécifique.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'anomalie
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de l'anomalie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anomaly'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Anomalie non trouvée
 *
 * /analytics/anomalies/detect:
 *   post:
 *     summary: Détecter les anomalies
 *     description: Lance la détection d'anomalies dans le système.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Détection lancée
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/anomalies/{id}/resolve:
 *   patch:
 *     summary: Résoudre une anomalie
 *     description: Marque une anomalie comme résolue.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'anomalie
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Anomalie résolue
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Anomalie non trouvée
 *
 * /analytics/anomalies/stats:
 *   get:
 *     summary: Statistiques des anomalies
 *     description: Retourne les statistiques sur les anomalies.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des anomalies
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/anomalies/sensors/faulty:
 *   get:
 *     summary: Capteurs défaillants
 *     description: Retourne la liste des capteurs défaillants.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des capteurs défaillants
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/metrics:
 *   get:
 *     summary: Récupérer les métriques
 *     description: Retourne les métriques générales du système.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métriques récupérées
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Metrics'
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/kpis:
 *   get:
 *     summary: Récupérer les KPIs
 *     description: Retourne les indicateurs clés de performance.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPIs récupérés
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/zones/{zoneId}/metrics:
 *   get:
 *     summary: Métriques d'une zone
 *     description: Retourne les métriques pour une zone spécifique.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: zoneId
 *         required: true
 *         description: ID de la zone
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Métriques de la zone
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/containers/{containerId}/metrics:
 *   get:
 *     summary: Métriques d'un conteneur
 *     description: Retourne les métriques pour un conteneur spécifique.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: containerId
 *         required: true
 *         description: ID du conteneur
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Métriques du conteneur
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/history:
 *   get:
 *     summary: Historique des métriques
 *     description: Retourne l'historique des métriques.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique des métriques
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/reports:
 *   get:
 *     summary: Lister les rapports
 *     description: Retourne la liste des rapports disponibles.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des rapports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/reports/{id}:
 *   get:
 *     summary: Récupérer un rapport
 *     description: Retourne les détails d'un rapport spécifique.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du rapport
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails du rapport
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Rapport non trouvé
 *
 * /analytics/reports/daily:
 *   post:
 *     summary: Générer un rapport quotidien
 *     description: Lance la génération d'un rapport quotidien.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Rapport généré
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/reports/weekly:
 *   post:
 *     summary: Générer un rapport hebdomadaire
 *     description: Lance la génération d'un rapport hebdomadaire.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Rapport généré
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/reports/monthly:
 *   post:
 *     summary: Générer un rapport mensuel
 *     description: Lance la génération d'un rapport mensuel.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Rapport généré
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/reports/{id}/export:
 *   get:
 *     summary: Exporter un rapport
 *     description: Exporte un rapport au format demandé.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du rapport
 *         schema:
 *           type: integer
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, csv, json]
 *           default: pdf
 *         description: Format d'export
 *     responses:
 *       200:
 *         description: Rapport exporté
 *       401:
 *         description: Token JWT manquant ou invalide
 *       404:
 *         description: Rapport non trouvé
 *
 * /analytics/reports/schedule:
 *   post:
 *     summary: Programmer un rapport
 *     description: Programme la génération automatique d'un rapport.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *               schedule:
 *                 type: string
 *                 description: Expression cron pour la programmation
 *     responses:
 *       201:
 *         description: Rapport programmé
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/dashboard:
 *   get:
 *     summary: Tableau de bord général
 *     description: Retourne les données du tableau de bord principal.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du tableau de bord
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dashboard'
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/dashboard/zones:
 *   get:
 *     summary: Tableau de bord par zones
 *     description: Retourne les données du tableau de bord groupées par zones.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du tableau de bord par zones
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/dashboard/agents:
 *   get:
 *     summary: Tableau de bord par agents
 *     description: Retourne les données du tableau de bord groupées par agents.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du tableau de bord par agents
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/predictions/containers/{containerId}:
 *   get:
 *     summary: Prédiction pour un conteneur
 *     description: Retourne la prédiction de remplissage pour un conteneur spécifique.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: containerId
 *         required: true
 *         description: ID du conteneur
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prédiction du conteneur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prediction'
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/predictions/containers:
 *   get:
 *     summary: Prédictions pour tous les conteneurs
 *     description: Retourne les prédictions de remplissage pour tous les conteneurs.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prédictions de tous les conteneurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prediction'
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/predictions/critical:
 *   get:
 *     summary: Prédictions critiques
 *     description: Retourne les prédictions pour les conteneurs critiques.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prédictions critiques
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prediction'
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/predictions/validate:
 *   post:
 *     summary: Valider une prédiction
 *     description: Valide la précision d'une prédiction.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               predictionId:
 *                 type: integer
 *               actualValue:
 *                 type: number
 *     responses:
 *       200:
 *         description: Prédiction validée
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Token JWT manquant ou invalide
 *
 * /analytics/predictions/trends/{containerId}:
 *   get:
 *     summary: Tendances d'un conteneur
 *     description: Retourne les tendances de remplissage pour un conteneur.
 *     tags: [Analyses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: containerId
 *         required: true
 *         description: ID du conteneur
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tendances du conteneur
 *       401:
 *         description: Token JWT manquant ou invalide
 */
router.use('/analytics', auth, createProxyMiddleware({
  target: PROXY_CONFIG.analytics.url,
  changeOrigin: true,
  pathRewrite: {
    '^/analytics': '/analytics'
  },
  onError: (err, req, res) => {
    console.error('Proxy Error - Analytics Service:', err);
    res.status(503).json({
      error: 'Service Analytics indisponible',
      statusCode: 503,
      timestamp: new Date().toISOString()
    });
  }
}));


module.exports = router;
