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
        - **Authentification & Utilisateurs** : Service Users (port 3002) - [Documentation détaillée](http://localhost:3002/api-docs)
        - **Gestion des Conteneurs** : Service Containers (port 3001) - [Documentation détaillée](http://localhost:3001/api-docs)
        
        ## Authentification
        Utilisez un token JWT obtenu via \`POST /auth/login\`. Incluez-le dans l'en-tête autorisation : \`Authorization: Bearer <token>\`
      `,
      contact: {
        name: 'Équipe EcoTrack',
        email: 'contact@ecotrack.com'
      },
      license: {
        name: 'MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
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
        }
      }
    }
  },
  apis: [] // Pas de fichiers routes à scanner (le gateway est un proxy)
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
