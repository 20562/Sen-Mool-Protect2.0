const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const DeviceReading = require('../models/DeviceReading');

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalDevices, activeAlerts, activeBracelets, avgResponseTime] = await Promise.all([
      DeviceReading.distinct('deviceId'),
      Alert.countDocuments({ status: 'ACTIVE' }),
      DeviceReading.countDocuments({ timestamp: { $gte: new Date(Date.now() - 3600000) } }),
      Alert.aggregate([
        { $match: { status: 'RESOLVED' } },
        { $group: { _id: null, avgTime: { $avg: { $subtract: ['$resolvedAt', '$timestamp'] } } } }
      ])
    ]);
    
    res.json({
      totalDevices: totalDevices.length,
      activeAlerts,
      activeBracelets,
      avgResponseTime: avgResponseTime[0]?.avgTime || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recent alerts
router.get('/alerts/recent', async (req, res) => {
  try {
    const alerts = await Alert.find()
      .sort({ timestamp: -1 })
      .limit(20);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Device locations
router.get('/devices/locations', async (req, res) => {
  try {
    const locations = await DeviceReading.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { 
        _id: '$deviceId', 
        latitude: { $first: '$latitude' },
        longitude: { $first: '$longitude' },
        temperature: { $first: '$temperature' },
        heartRate: { $first: '$heartRate' },
        timestamp: { $first: '$timestamp' }
      }},
      { $limit: 100 }
    ]);
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Risk zones
router.get('/risk-zones', async (req, res) => {
  try {
    const riskZones = [
      { name: 'Pointe des Almadies', lat: 14.7473, lon: -17.5289, risk: 82 },
      { name: 'Langue de Barbarie', lat: 16.0469, lon: -16.2671, risk: 91 },
      { name: 'Casamance Sud', lat: 13.3065, lon: -14.9513, risk: 45 },
      { name: 'Cap-Vert', lat: 14.7133, lon: -17.4652, risk: 12 },
      { name: 'Mbour-Saly', lat: 14.3917, lon: -16.8369, risk: 58 }
    ];
    res.json(riskZones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
