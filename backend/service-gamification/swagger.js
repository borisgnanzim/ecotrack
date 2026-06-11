const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🏆 EcoTrack Gamification Service API',
      version: '1.0.0',
      description: `
        **Service de Gamification pour EcoTrack**
        
        API permettant de gérer l'engagement des utilisateurs via un système de points, 
        de badges et de défis. Ce service récompense les actions écologiques (collectes, signalements, etc.).
        
        ## Authentification
        Utilisez un token JWT valide.
        Incluez-le dans l'en-tête : \`Authorization: Bearer <token>\`
      `,
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3015}`,
        description: 'Environnement de développement local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu via le service-users'
        },
      },
      schemas: {
        Points: {
          type: 'object',
          properties: {
            userId: { type: 'string', format: 'uuid' },
            actionType: { type: 'string', example: 'container_report' },
            points: { type: 'integer', example: 50 },
            totalPoints: { type: 'integer', example: 1250 },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        Badge: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Eco-Citoyen Débutant' },
            description: { type: 'string' },
            iconUrl: { type: 'string', format: 'uri' },
            criteria: { type: 'object' }
          }
        },
        UserBadge: {
          type: 'object',
          properties: {
            userId: { type: 'string', format: 'uuid' },
            badgeId: { type: 'string', format: 'uuid' },
            earnedAt: { type: 'string', format: 'date-time' }
          }
        },
        Challenge: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            pointsReward: { type: 'integer' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            statusCode: { type: 'integer' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    tags: [
      { name: '🏆 Récompenses', description: 'Attribution de points et badges' },
      { name: '🎯 Défis', description: 'Gestion des challenges communautaires' },
      { name: '📊 Classement', description: 'Leaderboards et statistiques' }
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };