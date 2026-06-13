import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const PORT = process.env.PORT || 3012;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EcoTrack — Service Containers & Zones",
      version: "2.0.0",
      description: `
**Service de gestion des conteneurs intelligents et des zones géographiques.**

Gère le cycle de vie complet des conteneurs IoT : CRUD, niveaux de remplissage,
localisation GPS, photos, statistiques, et les zones géographiques de collecte
(polygones, choroplèthe, import/export GeoJSON/Shapefile).

## Authentification
Token JWT via \`/auth/login\` sur le service-users.
Header : \`Authorization: Bearer <token>\`

## URLs d'accès
- **Direct** : \`http://localhost:${PORT}\`
- **Via Gateway** : \`http://localhost:3010\`

## Fonctionnalités
- ✅ CRUD conteneurs (avec historique de remplissage)
- ✅ Géolocalisation (recherche par proximité GPS)
- ✅ Upload photos (multipart/form-data)
- ✅ Zones géographiques avec polygones GeoJSON
- ✅ Statistiques par zone + carte choroplèthe
- ✅ Import/Export GeoJSON et Shapefile
- ✅ Événements Kafka (conteneurs + zones)
- ✅ WebSocket temps-réel (Socket.IO)
      `,
      contact: { name: "EcoTrack Team" },
      license: { name: "MIT" },
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: "Service direct" },
      { url: "http://localhost:3010",    description: "Via API Gateway" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT obtenu via /auth/login",
        },
      },
      schemas: {

        // ── Conteneur ──────────────────────────────────────────────────────

        Conteneur: {
          type: "object",
          description: "Conteneur de déchets intelligent",
          properties: {
            id:        { type: "string", format: "uuid",      example: "550e8400-e29b-41d4-a716-446655440000" },
            type:      { type: "string",                      example: "plastique", description: "Type de déchet accepté" },
            status:    { type: "string", nullable: true,      example: "normal",    description: "État du conteneur" },
            zoneId:    { type: "string", nullable: true,      example: "ZD-PLAT",  description: "ID de la zone (référence Zone.id)" },
            capacity:  { type: "integer", nullable: true,     example: 240,         description: "Capacité en litres" },
            code:      { type: "integer",                     example: 1001,        description: "Code unique d'identification" },
            fillLevel: { type: "integer", minimum: 0, maximum: 100, example: 42,   description: "Niveau de remplissage (%)" },
            latitude:  { type: "number", format: "double", nullable: true, example: 14.6937 },
            longitude: { type: "number", format: "double", nullable: true, example: -17.4441 },
            photoUrl:  { type: "string", nullable: true,      example: "/uploads/conteneur-123.jpg" },
            zone:      { $ref: "#/components/schemas/ZoneSummary", nullable: true, description: "Zone associée (si inclus)" },
            createdAt: { type: "string", format: "date-time", example: "2026-03-01T08:00:00Z" },
            updatedAt: { type: "string", format: "date-time", example: "2026-06-13T10:30:00Z" },
          },
          required: ["id", "type", "code", "fillLevel"],
        },

        ConteneurCreate: {
          type: "object",
          description: "Payload de création d'un conteneur",
          required: ["type", "zoneId", "capacity", "latitude", "longitude"],
          properties: {
            type:      { type: "string", minLength: 3, example: "plastique" },
            zoneId:    { type: "string",               example: "ZD-PLAT",   description: "ID de la zone (ex: 'ZD-PLAT')" },
            capacity:  { type: "integer",              example: 240 },
            code:      { type: "integer",              example: 1005,         description: "Auto-généré si absent" },
            fillLevel: { type: "integer", minimum: 0, maximum: 100, example: 0 },
            latitude:  { type: "number",  minimum: -90, maximum: 90,   example: 14.6937 },
            longitude: { type: "number",  minimum: -180, maximum: 180, example: -17.4441 },
            status:    { type: "string",               example: "normal" },
          },
        },

        ConteneurUpdate: {
          type: "object",
          description: "Payload de mise à jour (tous les champs optionnels)",
          properties: {
            type:      { type: "string", example: "papier" },
            zoneId:    { type: "string", example: "ZD-MEDI" },
            capacity:  { type: "integer", example: 120 },
            fillLevel: { type: "integer", minimum: 0, maximum: 100, example: 75 },
            latitude:  { type: "number", example: 14.6954 },
            longitude: { type: "number", example: -17.4558 },
            status:    { type: "string", example: "en_maintenance" },
            photoUrl:  { type: "string", format: "uri" },
          },
        },

        FillHistory: {
          type: "object",
          properties: {
            id:          { type: "string", format: "uuid" },
            fillLevel:   { type: "integer", minimum: 0, maximum: 100, example: 75 },
            recordedAt:  { type: "string", format: "date-time" },
            containerId: { type: "string", format: "uuid" },
          },
          required: ["id", "fillLevel", "recordedAt", "containerId"],
        },

        FillHistoryCreate: {
          type: "object",
          required: ["fillLevel"],
          properties: {
            fillLevel:  { type: "integer", minimum: 0, maximum: 100, example: 80 },
            recordedAt: { type: "string",  format: "date-time", description: "Défaut: maintenant" },
          },
        },

        Statistics: {
          type: "object",
          description: "Statistiques globales des conteneurs",
          properties: {
            total:             { type: "integer", example: 1256 },
            parType:           { type: "object", additionalProperties: { type: "integer" } },
            statusCount:       { type: "object", additionalProperties: { type: "integer" } },
            totalCapacity:     { type: "integer", example: 301440 },
          },
        },

        // ── Zone ──────────────────────────────────────────────────────────

        Zone: {
          type: "object",
          description: "Zone géographique de collecte",
          properties: {
            id:          { type: "string",             example: "ZD-PLAT",           description: "Identifiant lisible unique (ex: ZD-PLAT)" },
            name:        { type: "string",             example: "Zone Plateau" },
            city:        { type: "string",             example: "Dakar" },
            district:    { type: "string", nullable: true, example: "Plateau" },
            description: { type: "string", nullable: true },
            isActive:    { type: "boolean",            example: true },
            polygon:     { $ref: "#/components/schemas/GeoJSONPolygon", nullable: true },
            latitude:    { type: "number", format: "double", nullable: true, example: 14.6937, description: "Centroïde latitude" },
            longitude:   { type: "number", format: "double", nullable: true, example: -17.4441 },
            createdAt:   { type: "string", format: "date-time" },
            updatedAt:   { type: "string", format: "date-time" },
          },
          required: ["id", "name", "city"],
        },

        ZoneSummary: {
          type: "object",
          description: "Vue résumée d'une zone (incluse dans les conteneurs)",
          properties: {
            id:       { type: "string", example: "ZD-PLAT" },
            name:     { type: "string", example: "Zone Plateau" },
            city:     { type: "string", example: "Dakar" },
            district: { type: "string", nullable: true },
          },
        },

        ZoneStats: {
          type: "object",
          description: "Statistiques agrégées d'une zone",
          properties: {
            containerCount:     { type: "integer", example: 42,   description: "Nombre de conteneurs dans la zone" },
            avgFillLevel:       { type: "number",  example: 67.3, description: "Taux de remplissage moyen (%)" },
            criticalContainers: { type: "integer", example: 5,    description: "Conteneurs avec fillLevel ≥ 80%" },
            maxFillLevel:       { type: "integer", example: 97 },
            minFillLevel:       { type: "integer", example: 3 },
            statusBreakdown:    { type: "object",  additionalProperties: { type: "integer" } },
            typeBreakdown:      { type: "object",  additionalProperties: { type: "integer" } },
          },
        },

        ZoneWithStats: {
          allOf: [
            { $ref: "#/components/schemas/Zone" },
            {
              type: "object",
              properties: {
                stats: { $ref: "#/components/schemas/ZoneStats" },
                containers: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Conteneur" },
                  description: "Présent uniquement sur GET /zones/:id",
                },
              },
            },
          ],
        },

        ZoneGlobalStats: {
          type: "object",
          description: "Vue d'ensemble de toutes les zones",
          properties: {
            totalZones:     { type: "integer", example: 12 },
            activeZones:    { type: "integer", example: 10 },
            totalContainers:{ type: "integer", example: 512 },
            avgFillLevel:   { type: "number",  example: 54.8, description: "Moyenne pondérée par nombre de conteneurs" },
            criticalZones:  { type: "integer", example: 2,    description: "Zones avec avgFillLevel ≥ 80%" },
            zonesStats:     {
              type: "array",
              items: {
                allOf: [
                  { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, city: { type: "string" } } },
                  { $ref: "#/components/schemas/ZoneStats" },
                ],
              },
            },
          },
        },

        CreateZoneBody: {
          type: "object",
          required: ["id", "name", "city"],
          description: "Payload de création d'une zone",
          properties: {
            id:          { type: "string", maxLength: 50, example: "ZD-PLAT",    description: "Identifiant unique lisible" },
            name:        { type: "string", minLength: 2,  example: "Zone Plateau" },
            city:        { type: "string",                example: "Dakar" },
            district:    { type: "string", nullable: true, example: "Plateau" },
            description: { type: "string", nullable: true },
            isActive:    { type: "boolean", default: true },
            polygon:     { $ref: "#/components/schemas/GeoJSONPolygon", nullable: true },
            latitude:    { type: "number", minimum: -90,  maximum: 90,  example: 14.6937 },
            longitude:   { type: "number", minimum: -180, maximum: 180, example: -17.4441 },
          },
          example: {
            id: "ZD-PLAT",
            name: "Zone Plateau",
            city: "Dakar",
            district: "Plateau",
            latitude: 14.6937,
            longitude: -17.4441,
            polygon: {
              type: "Polygon",
              coordinates: [[[-17.45,14.69],[-17.43,14.69],[-17.43,14.70],[-17.45,14.70],[-17.45,14.69]]],
            },
          },
        },

        UpdateZoneBody: {
          type: "object",
          description: "Payload de mise à jour (tous les champs optionnels, sauf id non modifiable)",
          properties: {
            name:        { type: "string" },
            city:        { type: "string" },
            district:    { type: "string", nullable: true },
            description: { type: "string", nullable: true },
            isActive:    { type: "boolean" },
            polygon:     { $ref: "#/components/schemas/GeoJSONPolygon", nullable: true },
            latitude:    { type: "number" },
            longitude:   { type: "number" },
          },
        },

        AssignContainersBody: {
          type: "object",
          required: ["containerIds"],
          properties: {
            containerIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
              minItems: 1,
              example: ["550e8400-e29b-41d4-a716-446655440000"],
            },
          },
        },

        // ── GeoJSON ───────────────────────────────────────────────────────

        GeoJSONPolygon: {
          type: "object",
          description: "Géométrie GeoJSON — Polygon ou MultiPolygon",
          properties: {
            type: {
              type: "string",
              enum: ["Polygon", "MultiPolygon"],
              example: "Polygon",
            },
            coordinates: {
              type: "array",
              items: { type: "array" },
              description: "Tableau de coordonnées [longitude, latitude]",
              example: [[[-17.45,14.69],[-17.43,14.69],[-17.43,14.70],[-17.45,14.70],[-17.45,14.69]]],
            },
          },
          required: ["type", "coordinates"],
        },

        FeatureCollection: {
          type: "object",
          description: "GeoJSON FeatureCollection",
          properties: {
            type: { type: "string", enum: ["FeatureCollection"] },
            features: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type:       { type: "string", enum: ["Feature"] },
                  geometry:   { $ref: "#/components/schemas/GeoJSONPolygon" },
                  properties: { type: "object" },
                },
              },
            },
          },
          example: {
            type: "FeatureCollection",
            features: [{
              type: "Feature",
              geometry: { type: "Polygon", coordinates: [[[-17.45,14.69],[-17.43,14.69],[-17.43,14.70],[-17.45,14.70],[-17.45,14.69]]] },
              properties: { id: "ZD-PLAT", name: "Zone Plateau", avgFillLevel: 67.3, fillCategory: "high" },
            }],
          },
        },

        ImportResult: {
          type: "object",
          description: "Résultat d'un import GeoJSON ou Shapefile",
          properties: {
            message: { type: "string", example: "Import GeoJSON terminé" },
            created: { type: "integer", example: 5 },
            updated: { type: "integer", example: 2 },
            skipped: { type: "integer", example: 1 },
            errors:  {
              type: "array",
              items: {
                type: "object",
                properties: {
                  reason:     { type: "string" },
                  properties: { type: "object" },
                },
              },
            },
          },
        },

        // ── Common ────────────────────────────────────────────────────────

        ErrorResponse: {
          type: "object",
          properties: {
            error:     { type: "string",  example: "Zone introuvable" },
            details:   { type: "array", items: { type: "object" } },
          },
        },
      },

      responses: {
        UnauthorizedError: {
          description: "Token JWT manquant ou expiré",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        ForbiddenError: {
          description: "Permissions insuffisantes",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        NotFoundError: {
          description: "Ressource non trouvée",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        ValidationError: {
          description: "Erreur de validation des données",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },

    tags: [
      { name: "Containers",          description: "Gestion CRUD des conteneurs" },
      { name: "Search & Stats",      description: "Recherche, géolocalisation et statistiques conteneurs" },
      { name: "Fill History",        description: "Historique de remplissage" },
      { name: "Photos",              description: "Upload et gestion des photos" },
      { name: "Zones",               description: "Zones géographiques de collecte" },
      { name: "Zones - Import/Export", description: "Import et export GeoJSON / Shapefile" },
    ],

    security: [{ bearerAuth: [] }],
  },

  // Inclure container ET zone routes
  apis: [
    "./src/routes/container.routes.js",
    "./src/routes/zone.routes.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi, swaggerSpec };
