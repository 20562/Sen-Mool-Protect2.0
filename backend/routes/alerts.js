const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// Get all active alerts
router.get('/active', async (req, res) => {
  try {
    const alerts = await Alert.find({ status: 'ACTIVE' })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get alert by ID
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update alert status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        status,
        notes,
        acknowledgedAt: new Date()
      },
      { new: true }
    );
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get alerts for device
router.get('/device/:deviceId', async (req, res) => {
  try {
    const alerts = await Alert.find({ deviceId: req.params.deviceId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
