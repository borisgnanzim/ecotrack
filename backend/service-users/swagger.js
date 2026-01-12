const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "EcoTrack User Service API Documentation",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string', enum: ['info','success','warning','error'] },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        NotificationCreate: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string', enum: ['info','success','warning','error'] }
          },
          required: ['title','message']
        },
        AuthRequest: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            password: { type: 'string' }
          },
          required: ['email','password']
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            message: { type: 'string' },
            user: { type: 'object' }
          }
        }
      }
    },
  },
  apis: ["./src/routes/*.js"], // fichiers où Swagger va lire les commentaires
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };