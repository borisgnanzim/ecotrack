const express = require('express');
const router = express.Router();
const { recordActionAndUpdatePoints } = require('../services/gamificationService');

// POST /gamification/report
router.post('/report', async (req, res) => {
  try {
    const { userId, actionType = 'report_container', metadata } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const result = await recordActionAndUpdatePoints({ userId, actionType, metadata });

    // TODO: send notification for earned badges via notification service

    res.json({ ok: true, result });
  } catch (err) {
    console.error('signalement error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
