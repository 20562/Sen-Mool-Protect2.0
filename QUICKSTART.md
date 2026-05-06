# Quickstart Guide - SEN-MOOL PROTECT 2.0

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for ML services)
- Git

## Quick Setup

### 1. Clone Repository & Setup

```bash
cd /Users/mac/Documents/Moolprotect2.0

# Copy environment file
cp .env.example .env

# Update .env with your configuration
nano .env
```

### 2. Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- **Backend API:** http://localhost:3000
- **MQTT Broker:** localhost:1883
- **MongoDB:** localhost:27017
- **Dashboard:** http://localhost:3001

### 3. Verify Services

```bash
# Check MQTT broker
mosquitto_sub -h localhost -t '$SYS/broker/clients/total' -W 1

# Check MongoDB
mongosh "mongodb://admin:password@localhost:27017/senmool"

# Check Backend API
curl http://localhost:3000/health

# Check ML Services logs
docker-compose logs ml-fall-detection
docker-compose logs ml-anomaly-detection
```

## Local Development (Without Docker)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp ../.env .env

# Start server
npm start
```

### MQTT Broker (macOS)

```bash
# Install Mosquitto
brew install mosquitto

# Start broker
mosquitto -c /usr/local/etc/mosquitto/mosquitto.conf

# In another terminal, test
mosquitto_sub -h localhost -t 'test/#'
mosquitto_pub -h localhost -t 'test/message' -m 'Hello'
```

### MongoDB (macOS)

```bash
# Install MongoDB Community
brew tap mongodb/brew
brew install mongodb-community

# Start service
brew services start mongodb-community

# Connect
mongosh
```

### Python ML Services

```bash
# Install Python dependencies
cd ml
pip install -r requirements.txt

# Run fall detection
python fall_detection.py

# In another terminal, run anomaly detection
python anomaly_detection.py
```

## Testing the System

### 1. Publish Test Data via MQTT

```bash
mosquitto_pub -h localhost -t "mool/bracelet/MOOL-001/data" -m '{
  "id": "MOOL-001",
  "lat": 14.7473,
  "lon": -17.5289,
  "temp": 28.5,
  "hr": 72,
  "accel": [0.1, 0.2, 0.3],
  "immersed": false,
  "ts": 1234567890
}'
```

### 2. Trigger SOS Alert

```bash
mosquitto_pub -h localhost -t "mool/alerts/sos" -m '{
  "device_id": "MOOL-001",
  "type": "MANUAL_SOS",
  "lat": 14.7473,
  "lon": -17.5289,
  "timestamp": 1234567890
}'
```

### 3. Trigger Fall Detection

```bash
# Publish simulated fall accelerometer data
for i in {1..25}; do
  mosquitto_pub -h localhost -t "mool/bracelet/MOOL-001/data" -m "{
    \"id\": \"MOOL-001\",
    \"lat\": 14.7473,
    \"lon\": -17.5289,
    \"temp\": 28.5,
    \"hr\": 72,
    \"accel\": [3.5, 3.2, 3.8],
    \"immersed\": false,
    \"ts\": $(date +%s)000
  }"
  sleep 0.1
done
```

### 4. Check Alerts in Database

```bash
mongosh
use senmool
db.alerts.find().pretty()
```

## API Examples

### Get Active Alerts

```bash
curl http://localhost:3000/api/alerts/active
```

### Get Device Locations

```bash
curl http://localhost:3000/api/dashboard/devices/locations
```

### Get Dashboard Stats

```bash
curl http://localhost:3000/api/dashboard/stats
```

### Update Alert Status

```bash
curl -X PATCH http://localhost:3000/api/alerts/{alertId}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ACKNOWLEDGED",
    "notes": "Confirmed with fisherman"
  }'
```

## WebSocket Testing

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:3000

# Messages sent by server
Connected to ws://localhost:3000/
> {"type": "device-update", "deviceId": "MOOL-001", ...}
> {"type": "alert", "id": "...", ...}
```

## Troubleshooting

### MQTT Connection Refused

```bash
# Check if Mosquitto is running
docker ps | grep mosquitto

# Verify ports
netstat -an | grep 1883

# Logs
docker-compose logs mosquitto
```

### MongoDB Connection Error

```bash
# Check MongoDB service
docker ps | grep mongodb

# Verify credentials in .env
cat .env | grep MONGODB

# Logs
docker-compose logs mongodb
```

### ML Service Not Detecting Falls

```bash
# Check ML service logs
docker-compose logs ml-fall-detection

# Verify MQTT connection
mosquitto_sub -h localhost -t "mool/bracelet/+/data"

# Test with higher acceleration values
mosquitto_pub -h localhost -t "mool/bracelet/MOOL-001/data" -m '{"accel": [4.0, 4.0, 4.0]}'
```

## Production Deployment

### Using Docker Compose

```bash
# Set environment
export NODE_ENV=production
export PORT=3000

# Start with restart policy
docker-compose -f docker-compose.yml up -d

# Scale ML services
docker-compose up -d --scale ml-fall-detection=2 --scale ml-anomaly-detection=2
```

### Using Kubernetes (Future)

```bash
# Build images
docker build -t senmool/backend:latest ./backend
docker build -t senmool/ml-fall:latest ./ml -f ml/Dockerfile.fall
docker build -t senmool/ml-anomaly:latest ./ml -f ml/Dockerfile.anomaly

# Deploy
kubectl apply -f k8s/
```

### SSL/TLS Setup

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/senmool.key \
  -out /etc/ssl/certs/senmool.crt

# Update MQTT broker config for TLS
# Update backend for HTTPS
# Update mobile app for certificate pinning
```

## Monitoring & Logging

### View Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Check Service Health

```bash
# Get service status
docker-compose ps

# Inspect specific service
docker-compose exec backend npm run health
```

### Monitor MQTT Traffic

```bash
# Subscribe to all topics
mosquitto_sub -h localhost -t '#' -v
```

## Performance Optimization

- Enable MQTT persistence in mosquitto.conf
- Add MongoDB indexes
- Use connection pooling in Node.js
- Enable caching for dashboard queries
- Consider Redis for session management

## Security Hardening

1. Change default credentials in .env
2. Enable TLS for MQTT (port 8883)
3. Enable HTTPS for backend (nginx reverse proxy)
4. Setup firewall rules
5. Enable MongoDB authentication
6. Use JWT expiration
7. Implement rate limiting on API

## Next Steps

1. Deploy ESP32 firmware to bracelets
2. Setup Flutter app on mobile devices
3. Configure Twilio for SMS alerts
4. Setup Firebase for push notifications
5. Configure production domain & SSL
6. Train ML models with real data
7. Setup monitoring & alerting

---

For detailed architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md)
