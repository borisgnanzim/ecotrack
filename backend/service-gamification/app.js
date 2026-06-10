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


module.exports = app;