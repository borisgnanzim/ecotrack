import express from "express";
import cors from "cors";
import containerRoutes from "./routes/container.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK", db: "Connected" });
});

app.use("/containers", containerRoutes);
app.use("/uploads", express.static("uploads"));

export default app;
