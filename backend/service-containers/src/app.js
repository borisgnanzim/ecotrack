import express from "express";
import containerRoutes from "./routes/container.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import { swaggerUi, swaggerSpec } from "../swagger.js";

const app = express();

// ===== Middlewares de Sécurité =====
app.use(helmet());
app.use(compression());

// Parse ALLOWED_ORIGINS from environment (comma-separated list)
const getDefaultOrigins = () => [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  'http://localhost:3010',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173'
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0)
  : getDefaultOrigins();

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ===== Body Parsing =====
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ===== Health Check =====
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "containers",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ===== API Routes =====
app.use("/containers", containerRoutes);

// ===== Swagger UI =====
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route non trouvée",
    path: req.path,
    method: req.method
  });
});

// ===== Error Handler (DOIT ÊTRE DERNIER) =====
app.use(errorHandler);

export default app;