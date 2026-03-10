import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const port = process.env.PORT || 3002;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: " EcoTrack Containers Service API",
      version: "1.0.0",
      description: `
        **Service de gestion des conteneurs de déchets intelligents**
        
        API pour la gestion complète des conteneurs : CRUD, géolocalisation, historique de remplissage,
        upload photo, statistiques et notifications temps-réel via WebSocket.
        
        ## Authentification
        Utilisez un token JWT obtenu via le service-users (\`/auth/login\`).
        Incluez-le dans l'en-tête : \`Authorization: Bearer <token>\`
        
        ## Base URL
        \`http://localhost:${port}\`
        
        ## Features
        - ✅ CRUD complet des conteneurs
        - ✅ Géolocalisation (recherche par proximité)
        - ✅ Historique détaillé du remplissage
        - ✅ Upload de photos (multipart)
        - ✅ Statistiques globales
        - ✅ WebSocket temps-réel (Socket.IO)
        - ✅ Validation Zod des payloads
      `,
      contact: {
        name: "EcoTrack Team",
        url: "https://ecotrack.local"
      },
      license: {
        name: "MIT"
      }
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Développement"
      },
      {
        url: "http://api.ecotrack.local",
        description: "Production"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT du service-users"
        }
      },
      schemas: {
        Conteneur: {
          type: "object",
          description: "Conteneur de déchets",
          properties: {
            id_conteneur: { 
              type: "integer",
              description: "ID unique du conteneur",
              example: 1
            },
            type_Dechet: { 
              type: "string",
              enum: ["plastique", "papier", "verre", "compost"],
              description: "Type de déchet accepté",
              example: "plastique"
            },
            Statut: { 
              type: "string",
              enum: ["normal", "plein", "en_maintenance", "desactive"],
              description: "État du conteneur",
              example: "normal"
            },
            id_Zone: { 
              type: "string",
              description: "Identifiant de la zone géographique",
              example: "zoneB"
            },
            capacite_i: { 
              type: "integer",
              description: "Capacité en litres",
              example: 100
            },
            code_conteneur: { 
              type: "integer",
              description: "Code d'identification unique du conteneur",
              example: 1001
            },
            latitude: { 
              type: "number",
              format: "double",
              description: "Latitude GPS",
              example: 14.6937
            },
            longitude: { 
              type: "number",
              format: "double",
              description: "Longitude GPS",
              example: -16.4441
            },
            photo_url: { 
              type: "string",
              description: "URL de la photo du conteneur",
              example: "/uploads/conteneur-1709955930123.jpg",
              nullable: true
            },
            createdAt: { 
              type: "string",
              format: "date-time",
              description: "Date de création",
              example: "2026-03-01T08:00:00Z"
            },
            updatedAt: { 
              type: "string",
              format: "date-time",
              description: "Date dernière modification",
              example: "2026-03-09T10:30:00Z"
            }
          },
          required: ["id_conteneur", "type_Dechet", "id_Zone", "code_conteneur"]
        },
        ConteneurCreate: {
          type: "object",
          description: "Payload pour créer un conteneur",
          properties: {
            type_Dechet: { 
              type: "string",
              enum: ["plastique", "papier", "verre", "compost"],
              example: "plastique"
            },
            Statut: { 
              type: "string",
              enum: ["normal", "plein", "en_maintenance", "desactive"],
              example: "normal"
            },
            id_Zone: { 
              type: "string",
              example: "zoneB"
            },
            capacite_i: { 
              type: "integer",
              example: 100
            },
            code_conteneur: { 
              type: "integer",
              example: 1005
            },
            latitude: { 
              type: "number",
              example: 14.6937
            },
            longitude: { 
              type: "number",
              example: -16.4441
            }
          },
          required: ["type_Dechet", "id_Zone", "code_conteneur"]
        },
        ConteneurUpdate: {
          type: "object",
          description: "Payload pour mettre à jour un conteneur",
          properties: {
            type_Dechet: { 
              type: "string",
              enum: ["plastique", "papier", "verre", "compost"]
            },
            Statut: { 
              type: "string",
              enum: ["normal", "plein", "en_maintenance", "desactive"]
            },
            capacite_i: { 
              type: "integer"
            },
            latitude: { 
              type: "number"
            },
            longitude: { 
              type: "number"
            }
          }
        },
        FillHistory: {
          type: "object",
          description: "Relevé historique de remplissage",
          properties: {
            id: { 
              type: "integer",
              example: 5234
            },
            niveau: { 
              type: "integer",
              minimum: 0,
              maximum: 100,
              description: "Pourcentage de remplissage",
              example: 75
            },
            recordedAt: { 
              type: "string",
              format: "date-time",
              description: "Date du relevé",
              example: "2026-03-09T10:45:30Z"
            },
            conteneurId: { 
              type: "integer",
              example: 1
            }
          },
          required: ["id", "niveau", "recordedAt", "conteneurId"]
        },
        FillHistoryCreate: {
          type: "object",
          description: "Payload pour enregistrer un relevé de remplissage",
          properties: {
            niveau: { 
              type: "integer",
              minimum: 0,
              maximum: 100,
              example: 75
            }
          },
          required: ["niveau"]
        },
        Statistics: {
          type: "object",
          description: "Statistiques globales des conteneurs",
          properties: {
            total: { 
              type: "integer",
              example: 1256
            },
            by_status: {
              type: "object",
              properties: {
                normal: { type: "integer" },
                plein: { type: "integer" },
                en_maintenance: { type: "integer" },
                desactive: { type: "integer" }
              }
            },
            by_type: {
              type: "object",
              properties: {
                plastique: { type: "integer" },
                papier: { type: "integer" },
                verre: { type: "integer" },
                compost: { type: "integer" }
              }
            },
            average_fill_level: { 
              type: "number",
              example: 62.5
            },
            by_zone: {
              type: "object",
              additionalProperties: { type: "integer" }
            }
          }
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { 
                  type: "string",
                  enum: ["VALIDATION_ERROR", "UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND", "CONFLICT", "INTERNAL_ERROR"]
                },
                message: { type: "string" },
                details: { 
                  type: "array",
                  items: { type: "object" }
                }
              }
            },
            timestamp: { type: "string", format: "date-time" }
          }
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
            timestamp: { type: "string", format: "date-time" }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: "Token JWT manquant ou expiré",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" }
            }
          }
        },
        ForbiddenError: {
          description: "Permissions insuffisantes",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" }
            }
          }
        },
        NotFoundError: {
          description: "Ressource non trouvée",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" }
            }
          }
        },
        ValidationError: {
          description: "Erreur de validation des données",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ["./src/routes/container.routes.js"]
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
