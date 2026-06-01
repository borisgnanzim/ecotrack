require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const gamificationRoutes = require('./src/routes/gamificationRoutes');

app.use('/api/gamification', gamificationRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'service-gamification',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});


// Optional: handle unhandled rejections / exceptions to avoid silent crashes
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;