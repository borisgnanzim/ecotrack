const express = require("express");
const cors = require("cors");

const routes = require("./routes/routes.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

const PORT = process.env.PORT || 3003;

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Routes service running on port ${PORT}`);
});