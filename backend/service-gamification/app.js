require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { errorHandler } = require('./src/middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Utilisation du routeur centralisé (index.js du dossier routes)
app.use('/api/gamification', require('./src/routes'));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'service-gamification',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

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