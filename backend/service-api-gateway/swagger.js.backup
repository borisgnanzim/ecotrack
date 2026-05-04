const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoTrack API Gateway',
      version: '1.0.0',
      description: `
        **Passerelle API principale d'EcoTrack** - Point d'entrée unique pour tous les microservices.
        
        Cette gateway proxy les requêtes vers les services appropriés en appliquant un rate limiting global et des mesures de sécurité.
        
        ## Services Proxysés
        - **Authentification & Utilisateurs** : Service Users - [Documentation détaillée](${process.env.USERS_SERVICE_URL}/api-docs)
        - **Gestion des Conteneurs** : Service Containers - [Documentation détaillée](${process.env.CONTAINERS_SERVICE_URL}/api-docs)
        
        ## Authentification
        Utilisez un token JWT obtenu via \`POST /auth/login\`. Incluez-le dans l'en-tête autorisation : \`Authorization: Bearer <token>\`
      `,
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Environnement de développement'
      },
      {
        url: 'http://api.ecotrack.local',
        description: 'Environnement de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu via POST /auth/login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID utilisateur' },
            email: { type: 'string', format: 'email', description: 'Email utilisateur' },
            firstname: { type: 'string', description: 'Prénom' },
            lastname: { type: 'string', description: 'Nom de famille' },
            roles: {
              type: 'array',
              items: { type: 'string' },
              description: 'Rôles (citizen, admin)'
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstname', 'lastname'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            firstname: { type: 'string' },
            lastname: { type: 'string' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'JWT Token' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        Container: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            type_Dechet: { type: 'string', description: 'Type de déchet (papier, verre, compost, etc.)' },
            Statut: { type: 'string', description: 'Statut (plein, vide, maintenance)' },
            latitude: { type: 'number', format: 'float', description: 'Latitude GPS' },
            longitude: { type: 'number', format: 'float', description: 'Longitude GPS' },
            capacite_i: { type: 'integer', description: 'Capacité en litres' },
            code_conteneur: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Message d\'erreur' },
            statusCode: { type: 'integer' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID de la notification' },
            userId: { type: 'integer', description: 'ID de l\'utilisateur' },
            title: { type: 'string', description: 'Titre de la notification' },
            message: { type: 'string', description: 'Message de la notification' },
            isRead: { type: 'boolean', description: 'Statut de lecture' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Route: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID de la route' },
            name: { type: 'string', description: 'Nom de la route' },
            description: { type: 'string', description: 'Description de la route' },
            waypoints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  latitude: { type: 'number', format: 'float' },
                  longitude: { type: 'number', format: 'float' }
                }
              },
              description: 'Points de passage de la route'
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        AnalyticsReport: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID du rapport' },
            title: { type: 'string', description: 'Titre du rapport' },
            data: { type: 'object', description: 'Données du rapport' },
            generatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // Schémas pour les conteneurs
        Conteneur: {
          type: 'object',
          description: 'Conteneur de déchets',
          properties: {
            id_conteneur: { type: 'integer', description: 'ID unique du conteneur', example: 1 },
            type_Dechet: { type: 'string', enum: ['plastique', 'papier', 'verre', 'compost'], description: 'Type de déchet accepté', example: 'plastique' },
            Statut: { type: 'string', enum: ['normal', 'plein', 'en_maintenance', 'desactive'], description: 'État du conteneur', example: 'normal' },
            id_Zone: { type: 'string', description: 'Identifiant de la zone géographique', example: 'zoneB' },
            capacite_i: { type: 'integer', description: 'Capacité en litres', example: 100 },
            code_conteneur: { type: 'integer', description: 'Code d\'identification unique du conteneur', example: 1001 },
            latitude: { type: 'number', format: 'double', description: 'Latitude GPS', example: 14.6937 },
            longitude: { type: 'number', format: 'double', description: 'Longitude GPS', example: -16.4441 },
            photo_url: { type: 'string', description: 'URL de la photo du conteneur', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ConteneurCreate: {
          type: 'object',
          description: 'Payload pour créer un conteneur',
          properties: {
            type_Dechet: { type: 'string', enum: ['plastique', 'papier', 'verre', 'compost'] },
            Statut: { type: 'string', enum: ['normal', 'plein', 'en_maintenance', 'desactive'] },
            id_Zone: { type: 'string' },
            capacite_i: { type: 'integer' },
            code_conteneur: { type: 'integer' },
            latitude: { type: 'number' },
            longitude: { type: 'number' }
          },
          required: ['type_Dechet', 'id_Zone', 'code_conteneur']
        },
        ConteneurUpdate: {
          type: 'object',
          description: 'Payload pour mettre à jour un conteneur',
          properties: {
            type_Dechet: { type: 'string', enum: ['plastique', 'papier', 'verre', 'compost'] },
            Statut: { type: 'string', enum: ['normal', 'plein', 'en_maintenance', 'desactive'] },
            capacite_i: { type: 'integer' },
            latitude: { type: 'number' },
            longitude: { type: 'number' }
          }
        },
        FillHistory: {
          type: 'object',
          description: 'Relevé historique de remplissage',
          properties: {
            id: { type: 'integer' },
            niveau: { type: 'integer', minimum: 0, maximum: 100, description: 'Pourcentage de remplissage' },
            recordedAt: { type: 'string', format: 'date-time' },
            conteneurId: { type: 'integer' }
          }
        },
        FillHistoryCreate: {
          type: 'object',
          description: 'Payload pour enregistrer un relevé de remplissage',
          properties: {
            niveau: { type: 'integer', minimum: 0, maximum: 100 }
          },
          required: ['niveau']
        },
        Statistics: {
          type: 'object',
          description: 'Statistiques globales des conteneurs',
          properties: {
            total: { type: 'integer' },
            by_status: { type: 'object' },
            by_type: { type: 'object' },
            average_fill_level: { type: 'number' },
            by_zone: { type: 'object' }
          }
        },
        // Schémas pour les analyses
        Anomaly: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            type: { type: 'string' },
            severity: { type: 'string' },
            description: { type: 'string' },
            containerId: { type: 'integer' },
            detectedAt: { type: 'string', format: 'date-time' },
            resolved: { type: 'boolean' }
          }
        },
        Metrics: {
          type: 'object',
          properties: {
            totalContainers: { type: 'integer' },
            filledContainers: { type: 'integer' },
            averageFillLevel: { type: 'number' },
            collectionEfficiency: { type: 'number' }
          }
        },
        Report: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            type: { type: 'string' },
            data: { type: 'object' },
            generatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Prediction: {
          type: 'object',
          properties: {
            containerId: { type: 'integer' },
            predictedFillLevel: { type: 'number' },
            predictedTime: { type: 'string', format: 'date-time' },
            confidence: { type: 'number' }
          }
        },
        Dashboard: {
          type: 'object',
          properties: {
            totalContainers: { type: 'integer' },
            activeAlerts: { type: 'integer' },
            collectionRate: { type: 'number' },
            zones: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    }
  },
  apis: ['./src/routes/**/*.js'] // Pas de fichiers routes à scanner (le gateway est un proxy)
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
