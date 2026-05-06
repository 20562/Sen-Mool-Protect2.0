# SEN-MOOL PROTECT 2.0 - System Architecture

## Overview

SEN-MOOL PROTECT 2.0 is an integrated IoT maritime safety system combining:

1. **Wearable IoT** (ESP32 Bracelet)
2. **Backend Services** (Node.js + MQTT)
3. **Machine Learning** (Python)
4. **Mobile App** (Flutter)
5. **Cloud Storage** (MongoDB)

## System Components

### 1. Bracelet IoT (Hardware Layer)

**Device:** ESP32 with integrated sensors

**Specifications:**
- **CPU:** Dual-core 240MHz
- **RAM:** 520KB SRAM
- **Storage:** 4MB Flash
- **Connectivity:** WiFi, Bluetooth, GSM (SIM800L), LoRa (RFM95W)

**Sensors:**
- **GPS:** NEO-6M (5m accuracy in open space)
- **Accelerometer:** MPU6050 (6-axis IMU)
- **Heart Rate:** MAX30100 (pulse oximeter)
- **Temperature:** DS18B20 (waterproof)
- **Immersion:** Capacitive moisture sensor

**Power:**
- Battery: LiPo 3.7V 1500mAh
- Expected Runtime: 72h in active mode

**Communication:**
- Primary: LoRa Mesh Network (868 MHz)
- Fallback: GSM/2G
- Secondary: WiFi (port area)
- Protocol: MQTT over TCP/SSL

### 2. Backend Server (Node.js)

**Technology Stack:**
- Express.js (REST API)
- Socket.io (WebSocket)
- MQTT.js (Message Broker)
- MongoDB (Data Storage)
- JWT (Authentication)

**Services:**

#### A. MQTT Broker Connector
```
Subscribes to:
- mool/bracelet/+/data    → Device telemetry
- mool/alerts/#           → Emergency alerts
- mool/bracelet/+/status  → Device status

Publishes to:
- mool/dashboard/+        → Real-time updates
- mool/notifications/+    → User notifications
```

#### B. REST API Endpoints

```
GET /api/devices            - List active devices
GET /api/devices/:id        - Device status
GET /api/devices/:id/history - Telemetry history
GET /api/alerts             - All alerts
GET /api/alerts/active      - Active only
POST /api/alerts/:id/status - Update alert
GET /api/dashboard/stats    - Dashboard KPIs
GET /api/dashboard/locations - Device map data
```

#### C. WebSocket Events

```
connection
- authenticate → Validate JWT
- join-dashboard → Subscribe to room
- disconnect → Cleanup

Broadcasts:
- device-update → GPS, sensors
- alert → Emergency + automatic
- anomaly-detected → ML triggers
```

### 3. Machine Learning Services (Python)

#### A. Fall Detection
```
Input: Accelerometer data (x, y, z)
Process:
- Buffer last 20 readings (2 sec)
- Extract 5 features (magnitude, rate)
- RF Classifier (100 trees)
- Confidence > 0.7 → Alert

Latency: < 500ms
```

#### B. Anomaly Detection
```
Input: Heart rate, temperature
Process:
- Monitor against normal ranges
- Detect trends (5+ bpm/min change)
- Rate limit (5 min between alerts)
- Classify priority (LOW/MEDIUM/HIGH/CRITICAL)

Conditions:
- HR < 40 bpm → CRITICAL_LOW
- HR > 140 bpm → CRITICAL_HIGH
- Temp < 35°C → HYPOTHERMIA
- Temp > 40°C → HYPERTHERMIA
```

### 4. Mobile App (Flutter)

**Features:**
- Real-time device tracking (Google Maps)
- Alert notifications (Firebase Cloud Messaging)
- Device control (remote commands)
- Historical analytics
- Offline support (SQLite sync)

**Screens:**
1. Dashboard: Live map + alerts
2. Devices: List + individual tracking
3. Alerts: History + acknowledge
4. Settings: Preferences + emergency contacts

### 5. Database Schema

#### Alert Collection
```javascript
{
  _id: ObjectId,
  deviceId: String,
  type: "MANUAL_SOS" | "IMMERSION_DETECTED" | "FALL_DETECTED" | "ABNORMAL_HEART_RATE",
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  latitude: Number,
  longitude: Number,
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED",
  timestamp: Date,
  resolvedAt: Date,
  acknowledgedBy: String,
  notes: String
}
```

#### DeviceReading Collection
```javascript
{
  _id: ObjectId,
  deviceId: String,
  latitude: Number,
  longitude: Number,
  temperature: Number,
  heartRate: Number,
  accelerometer: {
    x: Number, y: Number, z: Number
  },
  immersed: Boolean,
  batteryLevel: Number,
  signalStrength: Number,
  timestamp: Date
}
```

## Data Flow

### Scenario 1: Manual SOS

```
User Press Button
        ↓
ESP32 Detects (GPIO interrupt)
        ↓
Trigger Buzzer + LED
        ↓
Publish to MQTT: mool/alerts/sos
        ↓
Node.js receives via MQTT
        ↓
Store in MongoDB (Alert)
        ↓
Broadcast via WebSocket to Dashboard
        ↓
Send SMS/Email to Emergency Contacts (Twilio)
        ↓
Mobile App Receives FCM Notification
```

### Scenario 2: Automatic Fall Detection

```
Accelerometer samples at 10Hz
        ↓
Send to Backend every 2 sec
        ↓
Python ML Service receives (MQTT)
        ↓
Buffer 20 readings
        ↓
RF Classifier evaluates
        ↓
If Fall (conf > 0.7):
   Publish: mool/alerts/automatic
        ↓
Node.js creates Alert
        ↓
Dashboard updates + notifications
```

### Scenario 3: Anomaly Detected

```
Device sends HR: 145 bpm
        ↓
Anomaly Service processes (MQTT)
        ↓
Checks: 145 > 140 (CRITICAL_HIGH)
        ↓
Rate limit check (< 5 min since last alert)
        ↓
Publish anomaly alert
        ↓
Backend creates Alert (priority: CRITICAL)
        ↓
WebSocket broadcast
```

## Network Topology

### LoRa Mesh Network
```
Bracelet1 ←→ Bracelet2
    ↑            ↑
    ├─→ Bracelet3 ←┤
         ↓
    [Gateway]
         ↓
    [Internet]
         ↓
    Node.js Backend
```

### Fallback: GSM Direct Connection
```
Bracelet → [SIM Card] → [2G GSM] → [Internet] → Node.js
```

## Deployment

### Docker Stack (Recommended)

```yaml
services:
  mqtt:
    image: eclipse-mosquitto:latest
    ports: [1883, 8883]
  
  mongodb:
    image: mongo:latest
    volumes: [./data:/data/db]
  
  backend:
    build: ./backend
    depends_on: [mqtt, mongodb]
    ports: [3000]
  
  ml-fall:
    build: ./ml
    depends_on: [mqtt, backend]
  
  ml-anomaly:
    build: ./ml
    depends_on: [mqtt, backend]
```

### Environment Variables

```bash
# Backend
MONGODB_URI=mongodb://localhost:27017/senmool
MQTT_BROKER=mqtt.senmool.sn
MQTT_PORT=1883
JWT_SECRET=your-secret-key
PORT=3000

# ML Services
API_URL=http://localhost:3000
MQTT_BROKER=localhost
MQTT_PORT=1883

# Device (ESP32)
SSID=MoolNetwork
PASSWORD=***
MQTT_SERVER=mqtt.senmool.sn
```

## Security Considerations

1. **MQTT:** TLS 1.3 + Username/Password
2. **API:** JWT Bearer Tokens
3. **Database:** MongoDB Atlas with IP whitelist
4. **ESP32:** Firmware signing + OTA updates
5. **Mobile:** Certificate pinning

## Performance Targets

| Metric | Target |
|--------|--------|
| Alert latency (manual) | < 1 sec |
| Alert latency (automatic) | < 3 sec |
| GPS accuracy | < 5m |
| Heart rate update | Every 2 sec |
| Dashboard update | Real-time |
| Mesh range | 2-5 km |
| Uptime | 99.9% |

## Scaling Considerations

- **Devices:** Current design supports 10,000+ devices
- **Database:** TTL indexes auto-delete data > 90 days
- **MQTT:** Broker can handle 100K concurrent connections
- **Node.js:** Horizontal scaling with load balancer
- **ML:** Process data asynchronously without blocking API

## Future Enhancements

1. [ ] Voice alerts (Twilio TTS)
2. [ ] Predictive analytics (time-series forecasting)
3. [ ] Integration with national authorities
4. [ ] Blockchain for immutable alert logs
5. [ ] Satellite backhaul for remote areas
6. [ ] Multi-language support (Wolof, Pulaar, Serer)
7. [ ] Offline-first React Native fallback
8. [ ] 5G/NR-Light support

---

**Architecture Version:** 1.0.0  
**Last Updated:** May 5, 2026  
**Maintained By:** SEN-MOOL PROTECT Team
