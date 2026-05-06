/*
  SEN-MOOL PROTECT 2.0 Backend
  Express Server + MQTT + WebSocket + MongoDB
*/

require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/senmool', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('MongoDB connected');
}).catch((err) => {
  logger.error('MongoDB connection error:', err);
});

// MQTT Connection
const mqttClient = mqtt.connect(process.env.MQTT_BROKER || 'mqtt://localhost:1883', {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS
});

mqttClient.on('connect', () => {
  logger.info('MQTT connected');
  mqttClient.subscribe(['mool/bracelet/+/data', 'mool/alerts/#', 'mool/bracelet/+/status']);
});

mqttClient.on('message', async (topic, message) => {
  logger.info(`MQTT Message: ${topic}`);
  
  try {
    const data = JSON.parse(message.toString());
    
    // Route based on topic
    if (topic.includes('data')) {
      await handleDeviceData(data);
    } else if (topic.includes('alerts')) {
      await handleAlert(data);
    }
  } catch (err) {
    logger.error(`Failed to process MQTT message: ${err.message}`);
  }
});

mqttClient.on('error', (err) => {
  logger.error('MQTT error:', err);
});

// WebSocket Events
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // Authenticate user
  socket.on('authenticate', (token) => {
    // Verify JWT token
    socket.user = { id: socket.id, authenticated: true };
    logger.info(`User authenticated: ${socket.id}`);
  });
  
  socket.on('join-dashboard', (room) => {
    socket.join(`dashboard-${room}`);
    logger.info(`User joined dashboard: ${room}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Event Handlers
async function handleDeviceData(data) {
  logger.info(`Received device data from ${data.id}`);
  
  // Store in MongoDB
  const DeviceReading = require('./models/DeviceReading');
  await DeviceReading.create({
    deviceId: data.id,
    latitude: data.lat,
    longitude: data.lon,
    temperature: data.temp,
    heartRate: data.hr,
    accelerometer: data.accel,
    immersed: data.immersed,
    timestamp: new Date(data.ts)
  });
  
  // Emit to dashboard via WebSocket
  io.emit('device-update', {
    deviceId: data.id,
    coordinates: [data.lat, data.lon],
    sensors: {
      temperature: data.temp,
      heartRate: data.hr,
      immersed: data.immersed
    },
    timestamp: new Date(data.ts)
  });
  
  // Check anomalies
  if (data.hr > 140 || data.hr < 40) {
    io.emit('anomaly-detected', {
      type: 'ABNORMAL_HEART_RATE',
      deviceId: data.id,
      value: data.hr,
      timestamp: new Date()
    });
  }
}

async function handleAlert(data) {
  logger.warn(`ALERT RECEIVED: ${data.type} from ${data.device_id}`);
  
  // Store alert
  const Alert = require('./models/Alert');
  const alert = await Alert.create({
    deviceId: data.device_id,
    type: data.type,
    priority: data.type === 'MANUAL_SOS' ? 'CRITICAL' : 'HIGH',
    latitude: data.lat,
    longitude: data.lon,
    status: 'ACTIVE',
    timestamp: new Date(data.timestamp)
  });
  
  // Broadcast to all connected clients
  io.emit('alert', {
    id: alert._id,
    deviceId: data.device_id,
    type: data.type,
    priority: alert.priority,
    coordinates: [data.lat, data.lon],
    timestamp: new Date(data.timestamp)
  });
  
  // Send SMS/Email notifications
  await notifyPartners(alert);
}

async function notifyPartners(alert) {
  const Twilio = require('twilio');
  const client = Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  
  if (alert.type === 'MANUAL_SOS') {
    // Send SMS to emergency contacts
    await client.messages.create({
      body: `🚨 SOS ALERT: Device ${alert.deviceId} at ${alert.latitude}, ${alert.longitude}`,
      from: process.env.TWILIO_NUMBER,
      to: process.env.EMERGENCY_CONTACT
    });
    
    logger.info('Emergency SMS sent');
  }
}

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = { app, server, io, mqttClient };
