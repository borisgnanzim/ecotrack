import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "EcoTrack Containers Service API",
      version: "1.0.0",
      description: "Documentation de l'API du service conteneurs",
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
        Conteneur: {
          type: 'object',
          properties: {
            id_conteneur: { type: 'integer' },
            type_Dechet: { type: 'string' },
            Statut: { type: 'string' },
            id_Zone: { type: 'string' },
            capacite_i: { type: 'integer' },
            code_conteneur: { type: 'integer' },
            latitude: { type: 'number', format: 'float' },
            longitude: { type: 'number', format: 'float' },
            photo_url: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ConteneurCreate: {
          type: 'object',
          properties: {
            type_Dechet: { type: 'string' },
            Statut: { type: 'string' },
            id_Zone: { type: 'string' },
            capacite_i: { type: 'integer' },
            code_conteneur: { type: 'integer' },
            latitude: { type: 'number', format: 'float' },
            longitude: { type: 'number', format: 'float' }
          },
          required: ['type_Dechet','id_Zone','code_conteneur']
        },
        FillHistory: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            niveau: { type: 'integer' },
            recordedAt: { type: 'string', format: 'date-time' },
            conteneurId: { type: 'integer' }
          }
        },
        FillHistoryCreate: {
          type: 'object',
          properties: {
            niveau: { type: 'integer' }
          },
          required: ['niveau']
        }
      }
    }
  },
  apis: ["src/routes/container.routes.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
