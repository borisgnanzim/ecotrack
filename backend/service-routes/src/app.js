require("dotenv").config();
const express = require("express");
const cors = require("cors");

const routes = require("./routes/routes.js");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

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

const corsOptions = {
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
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "service-routes",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/routes", routes);
app.use("/api/routes", routes);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.listen(PORT, () => {
//   console.log(`Routes service running on port ${PORT}`);
// });

app.use(errorHandler);

module.exports = app;
