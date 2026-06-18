const express = require('express');
const router = express.Router();

const signalement = require('../controllers/signalementController');

router.use('/gamification', signalement);

module.exports = router;
