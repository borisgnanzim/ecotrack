require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes.js");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// app.use("/api", routes); 

app.use(routes);
const PORT = process.env.PORT || 3013;

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
=======
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
>>>>>>> 4beda22 (feat optimisation)

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
    path: req.path,
    method: req.method,
  });
});

app.use(errorHandler);

module.exports = app;
