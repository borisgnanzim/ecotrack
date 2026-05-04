const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: '🚀 EcoTrack API Gateway',
      version: '1.0.0',
      description: `
        # 🌍 EcoTrack API Gateway

        **Passerelle API principale d'EcoTrack** - Point d'entrée unique pour tous les microservices.

        Cette gateway proxy les requêtes vers les services appropriés en appliquant un rate limiting global et des mesures de sécurité.

        ## 🔗 Services Proxysés

        | Service | URL | Description |
        |---------|-----|-------------|
        | 👥 **Users** | [${process.env.USERS_SERVICE_URL || 'http://localhost:3011'}](${process.env.USERS_SERVICE_URL || 'http://localhost:3011'}/api-docs) | Authentification & gestion utilisateurs |
        | 🗂️ **Containers** | [${process.env.CONTAINERS_SERVICE_URL || 'http://localhost:3012'}](${process.env.CONTAINERS_SERVICE_URL || 'http://localhost:3012'}/api-docs) | Gestion des conteneurs |
        | 🛣️ **Routes** | [${process.env.ROUTES_SERVICE_URL || 'http://localhost:3013'}](${process.env.ROUTES_SERVICE_URL || 'http://localhost:3013'}/api-docs) | Gestion des routes |
        | 📊 **Analytics** | [${process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3014'}](${process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3014'}/api-docs) | Analyses et rapports |

        ## 🔐 Authentification

        Utilisez un token JWT obtenu via \`POST /auth/login\`. Incluez-le dans l'en-tête autorisation :
        \`\`\`
        Authorization: Bearer <token>
        \`\`\`

        ## ⚡ Rate Limiting

        - **100 requêtes par fenêtre de 15 minutes** par IP
        - **500 requêtes par fenêtre de 15 minutes** pour les utilisateurs authentifiés
        - Cache intelligent pour optimiser les performances

        ## 📊 Monitoring

        - **GET /health** : État des services
        - **GET /stats** : Statistiques de performance
        - **GET /cache/stats** : Statistiques du cache Redis
      `,
      contact: {
        name: 'EcoTrack Team',
        email: 'support@ecotrack.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3010}`,
        description: '🖥️ Environnement de développement'
      },
      {
        url: 'https://api.ecotrack.com',
        description: '🌐 Environnement de production'
      },
      {
        url: 'https://staging-api.ecotrack.com',
        description: '🧪 Environnement de staging'
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
          required: ['id', 'email', 'firstname', 'lastname'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique de l\'utilisateur',
              example: 1
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email de l\'utilisateur',
              example: 'john.doe@example.com'
            },
            firstname: {
              type: 'string',
              description: 'Prénom de l\'utilisateur',
              example: 'John'
            },
            lastname: {
              type: 'string',
              description: 'Nom de famille de l\'utilisateur',
              example: 'Doe'
            },
            roles: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['citizen', 'admin', 'collector']
              },
              description: 'Rôles de l\'utilisateur',
              example: ['citizen']
            },
            avatar: {
              type: 'string',
              format: 'uri',
              description: 'URL de l\'avatar de l\'utilisateur',
              example: 'https://api.ecotrack.com/uploads/avatars/1.webp'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création du compte',
              example: '2023-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière modification',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email de l\'utilisateur',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              description: 'Mot de passe (minimum 6 caractères)',
              example: 'securePassword123'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstname', 'lastname'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email unique',
              example: 'newuser@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              description: 'Mot de passe sécurisé',
              example: 'mySecurePassword123'
            },
            firstname: {
              type: 'string',
              description: 'Prénom',
              example: 'Jane'
            },
            lastname: {
              type: 'string',
              description: 'Nom de famille',
              example: 'Smith'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'Token JWT pour l\'authentification',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            message: {
              type: 'string',
              description: 'Message de confirmation',
              example: 'Connexion réussie'
            }
          }
        },
        Container: {
          type: 'object',
          required: ['id', 'type_Dechet', 'latitude', 'longitude'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique du conteneur',
              example: 1
            },
            type_Dechet: {
              type: 'string',
              enum: ['papier', 'verre', 'compost', 'menager', 'plastique'],
              description: 'Type de déchet accepté',
              example: 'papier'
            },
            Statut: {
              type: 'string',
              enum: ['vide', 'rempli', 'maintenance', 'hors_service'],
              description: 'Statut actuel du conteneur',
              example: 'vide'
            },
            latitude: {
              type: 'number',
              format: 'float',
              minimum: -90,
              maximum: 90,
              description: 'Latitude GPS',
              example: 48.8566
            },
            longitude: {
              type: 'number',
              format: 'float',
              minimum: -180,
              maximum: 180,
              description: 'Longitude GPS',
              example: 2.3522
            },
            capacite_i: {
              type: 'integer',
              minimum: 1,
              description: 'Capacité en litres',
              example: 240
            },
            code_conteneur: {
              type: 'string',
              description: 'Code unique du conteneur',
              example: 'ECO-PAR-001'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
              example: '2023-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière modification',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID unique de la notification',
              example: '550e8400-e29b-41d4-a716-446655440000'
            },
            userId: {
              type: 'integer',
              description: 'ID de l\'utilisateur destinataire',
              example: 1
            },
            title: {
              type: 'string',
              description: 'Titre de la notification',
              example: 'Conteneur plein détecté'
            },
            message: {
              type: 'string',
              description: 'Contenu de la notification',
              example: 'Le conteneur ECO-PAR-001 situé rue de la Paix est plein à 95%'
            },
            type: {
              type: 'string',
              enum: ['info', 'success', 'warning', 'error'],
              description: 'Type de notification',
              example: 'warning'
            },
            isRead: {
              type: 'boolean',
              description: 'Statut de lecture',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['ok', 'degraded', 'down'],
              description: 'État général du système',
              example: 'ok'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Horodatage de la vérification',
              example: '2023-01-01T00:00:00.000Z'
            },
            uptime: {
              type: 'number',
              description: 'Temps de fonctionnement en secondes',
              example: 3600
            },
            environment: {
              type: 'string',
              description: 'Environnement d\'exécution',
              example: 'development'
            },
            services: {
              type: 'object',
              description: 'État des services proxysés',
              properties: {
                users: {
                  type: 'string',
                  enum: ['up', 'down'],
                  example: 'up'
                },
                containers: {
                  type: 'string',
                  enum: ['up', 'down'],
                  example: 'up'
                },
                routes: {
                  type: 'string',
                  enum: ['up', 'down'],
                  example: 'up'
                },
                analytics: {
                  type: 'string',
                  enum: ['up', 'down'],
                  example: 'up'
                }
              }
            }
          }
        },
        CacheStats: {
          type: 'object',
          properties: {
            cache: {
              type: 'object',
              properties: {
                hits: { type: 'integer', description: 'Nombre de hits cache', example: 1250 },
                misses: { type: 'integer', description: 'Nombre de misses cache', example: 89 },
                keys: { type: 'integer', description: 'Nombre de clés en cache', example: 45 },
                memory: { type: 'string', description: 'Utilisation mémoire', example: '2.5MB' }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        Error: {
          type: 'object',
          required: ['error', 'statusCode'],
          properties: {
            error: {
              type: 'string',
              description: 'Message d\'erreur descriptif',
              example: 'Invalid credentials'
            },
            statusCode: {
              type: 'integer',
              description: 'Code de statut HTTP',
              example: 401
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Horodatage de l\'erreur',
              example: '2023-01-01T00:00:00.000Z'
            },
            path: {
              type: 'string',
              description: 'Chemin de la requête ayant causé l\'erreur',
              example: '/auth/login'
            },
            method: {
              type: 'string',
              description: 'Méthode HTTP utilisée',
              example: 'POST'
            }
          }
        }
      }
    },
    tags: [
      {
        name: '🔐 Authentification',
        description: 'Endpoints pour l\'authentification et la gestion des utilisateurs'
      },
      {
        name: '👥 Utilisateurs',
        description: 'Gestion des profils utilisateurs'
      },
      {
        name: '🗂️ Conteneurs',
        description: 'Gestion des conteneurs de déchets'
      },
      {
        name: '🛣️ Routes',
        description: 'Gestion des routes de collecte'
      },
      {
        name: '📊 Analyses',
        description: 'Statistiques et analyses'
      },
      {
        name: '🔔 Notifications',
        description: 'Gestion des notifications'
      },
      {
        name: '❤️ Health',
        description: 'Surveillance et monitoring du système'
      },
      {
        name: '💾 Cache',
        description: 'Gestion du cache Redis'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/routes/**/*.js'
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
