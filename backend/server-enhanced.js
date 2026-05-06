// Enhanced server.js with WebSocket support
// This file improves the existing backend/server.js

const express = require('express')
const mongoose = require('mongoose')
const mqtt = require('mqtt')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
require('dotenv').config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/senmool')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err))

// MQTT Connection
const mqttClient = mqtt.connect(
  `mqtt://${process.env.MQTT_BROKER || 'localhost'}:${process.env.MQTT_PORT || 1883}`,
  {
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS,
  }
)

mqttClient.on('connect', () => {
  console.log('✅ MQTT connected')
  mqttClient.subscribe('fishermen/+/data')
  mqttClient.subscribe('alerts/+')
})

// In-memory store for active connections
const activeFishermen = new Map()
const activeAlerts = []

// ==================== MQTT HANDLERS ====================

mqttClient.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString())

    if (topic.startsWith('fishermen/')) {
      handleFishermanData(data)
    } else if (topic.startsWith('alerts/')) {
      handleAlert(data)
    }
  } catch (err) {
    console.error('Error processing MQTT message:', err)
  }
})

function handleFishermanData(data) {
  const {
    fishermanId,
    latitude,
    longitude,
    heartRate,
    temperature,
    batteryLevel,
    status,
  } = data

  // Update in-memory store
  activeFishermen.set(fishermanId, {
    id: fishermanId,
    name: data.name || `Pêcheur ${fishermanId}`,
    status: status || 'online',
    latitude,
    longitude,
    heartRate,
    temperature,
    batteryLevel,
    lastUpdate: new Date(),
    boatId: data.boatId || 'N/A',
  })

  // Broadcast to all connected clients
  io.emit('fisherman:update', activeFishermen.get(fishermanId))

  // Check thresholds for anomalies
  checkAnomalies(fishermanId, data)
}

function handleAlert(data) {
  const alert = {
    id: `alert_${Date.now()}`,
    fishermanId: data.fishermanId,
    fishermanName: data.fishermanName,
    type: data.type || 'SOS',
    severity: data.severity || 'high',
    timestamp: new Date(),
    resolved: false,
    latitude: data.latitude,
    longitude: data.longitude,
    description: data.description,
  }

  activeAlerts.push(alert)

  // Broadcast to all connected clients
  io.emit('alert:new', alert)

  // Log alert
  console.log(`🚨 Alert: ${data.type} from ${data.fishermanName}`)
}

function checkAnomalies(fishermanId, data) {
  const anomalies = []

  if (data.heartRate > 120) {
    anomalies.push('Fréquence cardiaque élevée')
  }
  if (data.temperature > 38) {
    anomalies.push('Température corporelle élevée')
  }
  if (data.batteryLevel < 15) {
    anomalies.push('Batterie faible')
  }

  if (anomalies.length > 0) {
    handleAlert({
      fishermanId,
      fishermanName: data.name,
      type: 'ANOMALY',
      severity: 'medium',
      latitude: data.latitude,
      longitude: data.longitude,
      description: anomalies.join(', '),
    })
  }
}

// ==================== API ENDPOINTS ====================

// Get all fishermen
app.get('/api/fishermen', (req, res) => {
  res.json(Array.from(activeFishermen.values()))
})

// Get specific fisherman
app.get('/api/fishermen/:id', (req, res) => {
  const fisherman = activeFishermen.get(req.params.id)
  if (!fisherman) return res.status(404).json({ error: 'Not found' })
  res.json(fisherman)
})

// Get all alerts
app.get('/api/alerts', (req, res) => {
  res.json(activeAlerts)
})

// Resolve alert
app.post('/api/alerts/:id/resolve', (req, res) => {
  const alert = activeAlerts.find((a) => a.id === req.params.id)
  if (!alert) return res.status(404).json({ error: 'Not found' })

  alert.resolved = true
  io.emit('alert:resolved', alert)
  res.json(alert)
})

// Get statistics
app.get('/api/stats', (req, res) => {
  const onlineCount = Array.from(activeFishermen.values()).filter(
    (f) => f.status === 'online'
  ).length

  res.json({
    totalFishermen: activeFishermen.size,
    onlineNow: onlineCount,
    activeAlerts: activeAlerts.filter((a) => !a.resolved).length,
    resolvedToday: activeAlerts.filter((a) => a.resolved).length,
  })
})

// ==================== WEBSOCKET HANDLERS ====================

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`)

  // Send initial data
  socket.emit('fishermen:all', Array.from(activeFishermen.values()))
  socket.emit('alerts:all', activeAlerts)

  // Handle client requests
  socket.on('stats:request', () => {
    const onlineCount = Array.from(activeFishermen.values()).filter(
      (f) => f.status === 'online'
    ).length

    socket.emit('stats:update', {
      totalFishermen: activeFishermen.size,
      onlineNow: onlineCount,
      activeAlerts: activeAlerts.filter((a) => !a.resolved).length,
      resolvedToday: activeAlerts.filter((a) => a.resolved).length,
    })
  })

  socket.on('alert:resolve', (alertId) => {
    const alert = activeAlerts.find((a) => a.id === alertId)
    if (alert) {
      alert.resolved = true
      io.emit('alert:resolved', alert)
    }
  })

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`)
  })
})

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ==================== SERVER START ====================

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Dashboard: http://localhost:5173`)
  console.log(`📡 WebSocket: ws://localhost:${PORT}`)
})

module.exports = { app, server, io, mqttClient }
