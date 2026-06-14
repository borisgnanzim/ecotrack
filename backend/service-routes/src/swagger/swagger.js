const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Service Routes API",
      version: "1.0.0",
      description:
        "API de gestion des routes de collecte — création, optimisation TSP, validation et suivi cartographique.",
    },
    servers: [
      { url: "http://localhost:3013", description: "Service direct" },
      { url: "http://localhost:3010", description: "Via API Gateway" },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT obtenu via POST /auth/login",
        },
      },
      schemas: {
        RouteStatus: {
          type: "string",
          enum: ["planned", "in_progress", "completed", "cancelled"],
          example: "planned",
        },
        RouteStep: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            routeId: { type: "string", format: "uuid" },
            containerId: { type: "string", format: "uuid" },
            stepOrder: { type: "integer", example: 1 },
            distanceFromPrevious: {
              type: "number",
              format: "float",
              nullable: true,
              description: "Distance en km depuis l'étape précédente",
              example: 2.4,
            },
            estimatedTimeFromPrevious: {
              type: "integer",
              nullable: true,
              description: "Temps estimé en minutes depuis l'étape précédente",
              example: 8,
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Route: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
            date: { type: "string", format: "date-time", example: "2026-07-01T00:00:00.000Z" },
            startTime: { type: "string", format: "date-time", nullable: true },
            endTime: { type: "string", format: "date-time", nullable: true },
            agentId: { type: "string", format: "uuid", nullable: true },
            status: { $ref: "#/components/schemas/RouteStatus" },
            containerIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
              description: "Liste des IDs de conteneurs à collecter",
            },
            totalDistance: {
              type: "number",
              format: "float",
              nullable: true,
              description: "Distance totale en km",
              example: 18.5,
            },
            estimatedTime: {
              type: "integer",
              nullable: true,
              description: "Durée estimée en minutes",
              example: 120,
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            steps: {
              type: "array",
              items: { $ref: "#/components/schemas/RouteStep" },
            },
            agent: {
              type: "object",
              nullable: true,
              description: "Informations de l'agent assigné",
            },
          },
        },
        CreateRouteBody: {
          type: "object",
          required: ["date"],
          properties: {
            date: {
              type: "string",
              format: "date",
              description: "Date de la collecte",
              example: "2026-07-15",
            },
            status: { $ref: "#/components/schemas/RouteStatus" },
            agentId: {
              type: "string",
              format: "uuid",
              nullable: true,
              description: "UUID de l'agent responsable",
            },
            containerIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
              description: "IDs des conteneurs à inclure",
              example: [],
            },
            startTime: { type: "string", format: "date-time", nullable: true },
            endTime: { type: "string", format: "date-time", nullable: true },
            totalDistance: { type: "number", format: "float", nullable: true },
            estimatedTime: { type: "integer", nullable: true },
          },
        },
        UpdateRouteBody: {
          type: "object",
          properties: {
            date: { type: "string", format: "date" },
            status: { $ref: "#/components/schemas/RouteStatus" },
            agentId: { type: "string", format: "uuid", nullable: true },
            containerIds: { type: "array", items: { type: "string", format: "uuid" } },
            startTime: { type: "string", format: "date-time", nullable: true },
            endTime: { type: "string", format: "date-time", nullable: true },
            totalDistance: { type: "number", format: "float" },
            estimatedTime: { type: "integer" },
          },
        },
        AssignAgentBody: {
          type: "object",
          required: ["agentId"],
          properties: {
            agentId: {
              type: "string",
              format: "uuid",
              nullable: true,
              description: "UUID de l'agent à assigner (null pour désassigner)",
            },
          },
        },
        ValidationResult: {
          type: "object",
          properties: {
            route_id: { type: "string", format: "uuid" },
            is_valid: { type: "boolean", example: true },
            validations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["error", "warning"] },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        OptimizeResult: {
          type: "object",
          properties: {
            route: { $ref: "#/components/schemas/Route" },
            critical_containers_added: {
              type: "boolean",
              description: "True si des conteneurs critiques (>80%) ont été ajoutés",
            },
            added_critical_containers: {
              type: "array",
              items: { type: "string", format: "uuid" },
            },
          },
        },
        GeoJSON: {
          type: "object",
          properties: {
            type: { type: "string", example: "FeatureCollection" },
            features: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", example: "Feature" },
                  geometry: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["Point", "LineString"] },
                      coordinates: { type: "array" },
                    },
                  },
                  properties: { type: "object" },
                },
              },
            },
          },
        },
        Error401: {
          type: "object",
          properties: {
            error: { type: "string", example: "Token manquant" },
          },
        },
        Error403: {
          type: "object",
          properties: {
            error: { type: "string", example: "Accès refusé — rôle requis : admin ou manager" },
          },
        },
        Error404: {
          type: "object",
          properties: {
            error: { type: "string", example: "Route non trouvée" },
          },
        },
        Error500: {
          type: "object",
          properties: {
            error: { type: "string", example: "Erreur interne" },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsDoc(options);
