const express = require('express');
const router = express.Router();
const DeviceReading = require('../models/DeviceReading');

// Get all active devices
router.get('/', async (req, res) => {
  try {
    const devices = await DeviceReading.distinct('deviceId');
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get device data
router.get('/:deviceId', async (req, res) => {
  try {
    const readings = await DeviceReading.find({ deviceId: req.params.deviceId })
      .sort({ timestamp: -1 })
      .limit(1);
    if (!readings.length) return res.status(404).json({ error: 'Device not found' });
    res.json(readings[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get device history
router.get('/:deviceId/history', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const startTime = new Date(Date.now() - hours * 3600000);
    
    const history = await DeviceReading.find({
      deviceId: req.params.deviceId,
      timestamp: { $gte: startTime }
    }).sort({ timestamp: -1 });
    
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
