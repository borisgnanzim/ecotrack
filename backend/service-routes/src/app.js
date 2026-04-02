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

app.listen(PORT, () => {
  console.log(`Routes service running on port ${PORT}`);
});

app.use(errorHandler);

module.exports = app;
