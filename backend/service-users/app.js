const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/routes/userRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');  
const notificationRoutes = require('./src/routes/notificationRoutes');
const errorMiddleware = require('./src/middleware/errorMiddleware');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Root and test routes
app.get('/', (req, res) => {
  res.send('EcoTrack User Service is running');
});

app.get('/test', (req, res) => {
  res.send('Test route is working');
});

// Routes
app.use('/auth', authRoutes);
app.use('/users/profile', profileRoutes);
app.use('/users', userRoutes);
app.use('/notifications', notificationRoutes);

// Serve uploaded assets (avatars)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger/OpenAPI Documentation - Combine swagger-jsdoc with auto-generated routes
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EcoTrack User Service API",
      version: "1.0.0",
      description: "API Documentation for User Management Service",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3011}`,
        description: "Development Server"
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
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            avatar: { type: 'string', format: 'uri' },
            roles: { 
              type: 'array',
              items: { 
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
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
        AuthRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['firstname', 'lastname', 'email', 'password', 'passwordConfirm'],
          properties: {
            firstname: { type: 'string' },
            lastname: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
            passwordConfirm: { type: 'string', format: 'password' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            message: { type: 'string' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            statusCode: { type: 'integer' }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Profile', description: 'User profile endpoints' },
      { name: 'Notifications', description: 'Notification endpoints' }
    ]
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error middleware
app.use(errorMiddleware);

module.exports = app;