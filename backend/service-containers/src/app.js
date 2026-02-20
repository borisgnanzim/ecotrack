import express from "express";
import containerRoutes from "./routes/container.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";

const app = express();

// ===== Middlewares de Sécurité =====
app.use(helmet());
app.use(compression());
app.use(cors({ 
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
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