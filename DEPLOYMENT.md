# Deployment Guide for SEN-MOOL PROTECT 2.0

## Prerequisites

- Docker & Docker Compose 20.10+
- Kubernetes 1.20+ (for K8s deployment)
- Git
- Node.js 18+ (for local development)

## Environment Setup

Create a `.env` file in the project root:

```env
# Database
MONGODB_PASSWORD=your_secure_mongodb_password
MONGODB_PORT=27017

# MQTT
MQTT_PORT=1883

# Backend
NODE_ENV=production
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# External Services
TWILIO_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
FIREBASE_PROJECT_ID=your_firebase_project_id

# Monitoring
GRAFANA_PASSWORD=your_grafana_admin_password
SENTRY_DSN=your_sentry_dsn_url
```

## Docker Deployment

### 1. Build and Run Locally

```bash
# Build all images
docker-compose build

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f ml-fall
docker-compose logs -f ml-anomaly

# Health check
curl http://localhost:3000/health
```

### 2. Scale Services

```bash
# Scale backend to 3 instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Behind Nginx, requests will be load balanced
```

### 3. Backup MongoDB

```bash
# Create backup
docker exec senmool-mongodb mongodump \
  --username admin \
  --password $MONGODB_PASSWORD \
  --authenticationDatabase admin \
  --out /backup

# Restore from backup
docker exec -i senmool-mongodb mongorestore \
  --username admin \
  --password $MONGODB_PASSWORD \
  --authenticationDatabase admin \
  /backup
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace senmool
kubectl config set-context --current --namespace=senmool
```

### 2. Create Secrets

```bash
kubectl create secret generic senmool-secrets \
  --from-literal=mongodb-password=$MONGODB_PASSWORD \
  --from-literal=jwt-secret=$JWT_SECRET \
  --from-literal=twilio-sid=$TWILIO_SID \
  --from-literal=twilio-token=$TWILIO_AUTH_TOKEN \
  -n senmool
```

### 3. Deploy Services

```bash
# Apply manifests
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/mosquitto-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/ml-services-deployment.yaml

# Check status
kubectl get deployments -n senmool
kubectl get pods -n senmool
```

### 4. Auto-scaling

```yaml
# k8s/backend-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: senmool
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Monitoring & Logging

### Access Dashboards

- **Grafana**: http://localhost:3001 (admin / ${GRAFANA_PASSWORD})
- **Prometheus**: http://localhost:9090
- **API Docs**: http://localhost:3000/api-docs

### View Logs

```bash
# Backend logs
docker-compose logs -f backend --tail 100

# All services
docker-compose logs -f

# Specific container
docker logs -f senmool-backend
```

## Performance Optimization

### 1. Enable Compression

Nginx config already includes gzip compression

### 2. Database Indexing

```javascript
// Run in MongoDB shell
db.fishermen.createIndex({ braceletId: 1 })
db.alerts.createIndex({ timestamp: -1, status: 1 })
db.readings.createIndex({ deviceId: 1, timestamp: -1 })
```

### 3. Cache Configuration

Redis can be added to docker-compose for caching:

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

## Security Hardening

### 1. SSL/TLS Certificates

```bash
# Generate self-signed certificate for testing
openssl req -x509 -newkey rsa:4096 -nodes \
  -out certs/cert.pem -keyout certs/key.pem -days 365

# In production, use Let's Encrypt via Certbot
```

### 2. Firewall Rules

```bash
# Allow only specific ports
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw allow 9090  # Prometheus
```

### 3. Database Security

```bash
# Enable authentication
mongo --host mongodb --username admin --password
```

## Troubleshooting

### Services not starting

```bash
# Check service logs
docker-compose logs senmool-backend

# Verify network connectivity
docker exec senmool-backend ping mosquitto
docker exec senmool-backend ping mongodb
```

### High memory usage

```bash
# Check container stats
docker stats

# Limit memory in docker-compose
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### Database connection issues

```bash
# Test MongoDB connection
docker exec senmool-mongodb mongosh -u admin -p $MONGODB_PASSWORD

# Check MQTT connection
docker exec senmool-mosquitto mosquitto_sub -h mosquitto -t "#"
```

## CI/CD Pipeline

Automated deployments are configured in `.github/workflows/ci-cd.yml`:

- Tests run on every PR
- Docker images built and pushed to registry
- Auto-deploy to production on main branch
- Health checks and automated rollback on failure

## Backup & Recovery

### Automated Daily Backup

```bash
# Add to crontab
0 2 * * * docker exec senmool-mongodb mongodump \
  --username admin --password $MONGODB_PASSWORD \
  --authenticationDatabase admin \
  --out /backups/mongo-$(date +\%Y\%m\%d)
```

### Database Recovery

```bash
# Point-in-time recovery
mongorestore --uri="mongodb://admin:password@localhost:27017" \
  --drop /path/to/backup
```

## Performance Benchmarks

Target metrics:
- API response time: < 100ms (p95)
- Alert processing: < 2 seconds
- MQTT message throughput: 10,000+ msg/sec
- WebSocket connections: 1,000+ concurrent

## Support & Maintenance

- Check logs daily
- Monitor Prometheus metrics
- Review Grafana dashboards
- Update dependencies monthly
- Test disaster recovery quarterly
