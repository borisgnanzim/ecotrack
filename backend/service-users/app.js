const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/routes/userRoutes');
const { swaggerUi, swaggerSpec } = require("./swagger");
const authMiddleware = require('./src/middleware/authMiddleware');
const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');  
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();


app.use(cors());
app.use(express.json());

// Root and test routes
app.get('/', (req, res) => {
  res.send('EcoTrack User Service is running');
});

app.get('/test', (req, res) => {
  res.send('Test route is working');
});


const path = require('path');
app.use('/auth', authRoutes);
app.use('/users/profile', profileRoutes);
app.use('/users', userRoutes);
app.use('/notifications', notificationRoutes);

// Serve uploaded assets (avatars)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
module.exports = app;