const express = require("express");
const cors = require("cors");

const routes = require("./routes/routes.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Routes service running on port ${PORT}`);
});