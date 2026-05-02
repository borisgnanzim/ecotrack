const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Service Analytics API",
      version: "1.0.0",
      description: "EcoTrack Analytics Service - Tableaux de bord, rapports et prédictions",
      contact: {
        name: "EcoTrack Team"
      }
    },
    servers: [
      {
        url: "http://localhost:3014",
        description: "Local Analytics Service"
      },
      {
        url: "http://api-gateway:3000/analytics",
        description: "Via API Gateway"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Metrics: {
          type: 'object',
          properties: {
            totalContainers: { type: 'integer', example: 150 },
            filledContainers: { type: 'integer', example: 45 },
            collectionEfficiency: { type: 'number', example: 85.5 },
            averageFillLevel: { type: 'number', example: 62.3 },
            predictedCollections: { type: 'integer', example: 23 },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        KPI: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            value: { type: 'number' },
            target: { type: 'number' },
            status: { type: 'string', enum: ['good', 'warning', 'critical'] },
            trend: { type: 'string', enum: ['up', 'down', 'stable'] },
            lastUpdated: { type: 'string', format: 'date-time' }
          }
        },
        Dashboard: {
          type: 'object',
          properties: {
            metrics: { $ref: '#/components/schemas/Metrics' },
            kpis: {
              type: 'array',
              items: { $ref: '#/components/schemas/KPI' }
            },
            recentAlerts: { type: 'array', items: { type: 'object' } },
            activeCollections: { type: 'integer' },
            pendingRoutes: { type: 'integer' }
          }
        },
        Report: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            type: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
            data: { type: 'object' },
            generatedAt: { type: 'string', format: 'date-time' },
            period: { type: 'object', properties: { start: { type: 'string' }, end: { type: 'string' } } }
          }
        },
        Prediction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            containerId: { type: 'integer' },
            predictedFillLevel: { type: 'number' },
            confidence: { type: 'number' },
            predictedCollectionTime: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['normal', 'warning', 'critical'] }
          }
        },
        Anomaly: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string' },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            description: { type: 'string' },
            affectedResource: { type: 'object' },
            detectedAt: { type: 'string', format: 'date-time' },
            resolved: { type: 'boolean' },
            resolvedAt: { type: 'string', format: 'date-time' }
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
    }
  },
  apis: [
    "./src/routes/metrics.js",
    "./src/routes/dashboard.js",
    "./src/routes/reports.js",
    "./src/routes/predictions.js",
    "./src/routes/anomalies.js"
  ]
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
