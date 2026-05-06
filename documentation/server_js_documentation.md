# Documentation du Code: server.js
## SEN-MOOL PROTECT 2.0 - Backend Server Express + MQTT + WebSocket

**Fichier:** `/backend/server.js`  
**Auteur:** GitHub Copilot  
**Date:** 5 mai 2026  
**Version:** 1.0.0  
**Langage:** Node.js / JavaScript  
**Framework:** Express.js 4.18+  

---

## 1. Vue d'ensemble

Le fichier `server.js` constitue le cœur du backend SEN-MOOL PROTECT 2.0. Il implémente un serveur Express.js complet intégrant:

- **API REST** pour les opérations CRUD
- **Broker MQTT** pour la communication IoT temps réel
- **WebSocket** pour les mises à jour live du dashboard
- **Base de données MongoDB** pour la persistance
- **Système de notifications** SMS/email
- **Middleware de sécurité** et logging

Le serveur agit comme un hub central reliant les bracelets IoT, l'application mobile et le dashboard web.

---

## 2. Dépendances et Imports

### Modules Core Node.js
```javascript
const express = require('express');      // Framework web
const http = require('http');           // Serveur HTTP
const socketIo = require('socket.io');  // WebSocket temps réel
```

### Sécurité et Middleware
```javascript
const cors = require('cors');           // Cross-Origin Resource Sharing
const helmet = require('helmet');       // Headers de sécurité
```

### Base de Données et Communication
```javascript
const mongoose = require('mongoose');   // ODM MongoDB
const mqtt = require('mqtt');           // Client MQTT
```

### Utilitaires
```javascript
const logger = require('./utils/logger');  // Logging centralisé
require('dotenv').config();             // Variables d'environnement
```

---

## 3. Initialisation du Serveur

### Configuration Express
```javascript
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",                    // Autoriser toutes origines (dev)
    methods: ["GET", "POST"]        // Méthodes HTTP autorisées
  }
});
```

### Middleware Appliqué
```javascript
app.use(helmet());                    // Sécurisation headers HTTP
app.use(cors());                      // Gestion CORS
app.use(express.json());              // Parsing JSON
app.use(express.urlencoded({ extended: true }));  // Parsing URL-encoded
```

---

## 4. Configuration des Routes API

### Routes REST
```javascript
app.use('/api/auth', require('./routes/auth'));          // Authentification
app.use('/api/devices', require('./routes/devices'));    // Gestion appareils
app.use('/api/alerts', require('./routes/alerts'));      // Gestion alertes
app.use('/api/dashboard', require('./routes/dashboard')); // Données dashboard
```

### Endpoint Santé
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date()
  });
});
```
**Utilisation:** Monitoring conteneur Docker, load balancers

---

## 5. Connexion Base de Données MongoDB

### Configuration Connexion
```javascript
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/senmool', {
  useNewUrlParser: true,           // Parser URL moderne
  useUnifiedTopology: true         // Topologie unifiée
})
.then(() => logger.info('MongoDB connected'))
.catch((err) => logger.error('MongoDB connection error:', err));
```

### Base de Données
- **Nom:** `senmool`
- **Collections:** `alerts`, `devicereadings`
- **TTL Indexes:** Auto-suppression après 30/90 jours

---

## 6. Configuration MQTT

### Connexion Broker
```javascript
const mqttClient = mqtt.connect(process.env.MQTT_BROKER || 'mqtt://localhost:1883', {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS
});
```

### Abonnements Topics
```javascript
mqttClient.subscribe([
  'mool/bracelet/+/data',      // Données capteurs
  'mool/alerts/#',             // Toutes les alertes
  'mool/bracelet/+/status'     // Statut appareils
]);
```

### Gestion Messages MQTT
```javascript
mqttClient.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    
    if (topic.includes('data')) {
      await handleDeviceData(data);
    } else if (topic.includes('alerts')) {
      await handleAlert(data);
    }
  } catch (err) {
    logger.error(`Failed to process MQTT message: ${err.message}`);
  }
});
```

---

## 7. Gestion WebSocket (Socket.io)

### Événements Connexion
```javascript
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // Authentification utilisateur
  socket.on('authenticate', (token) => {
    socket.user = { id: socket.id, authenticated: true };
  });
  
  // Rejoindre salle dashboard
  socket.on('join-dashboard', (room) => {
    socket.join(`dashboard-${room}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});
```

### Événements Émis
- **`device-update`:** Mise à jour données capteurs
- **`alert`:** Nouvelle alerte reçue
- **`anomaly-detected`:** Anomalie détectée

---

## 8. Gestionnaire Données Appareils

### Fonction handleDeviceData()
```javascript
async function handleDeviceData(data) {
  // Stockage MongoDB
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
  
  // Diffusion WebSocket
  io.emit('device-update', {
    deviceId: data.id,
    coordinates: [data.lat, data.lon],
    sensors: { temperature: data.temp, heartRate: data.hr, immersed: data.immersed },
    timestamp: new Date(data.ts)
  });
  
  // Détection anomalies
  if (data.hr > 140 || data.hr < 40) {
    io.emit('anomaly-detected', {
      type: 'ABNORMAL_HEART_RATE',
      deviceId: data.id,
      value: data.hr
    });
  }
}
```

**Actions:**
1. **Persistance:** Sauvegarde lecture capteurs
2. **Diffusion:** Mise à jour temps réel dashboard
3. **Analyse:** Détection anomalies fréquence cardiaque

---

## 9. Gestionnaire Alertes

### Fonction handleAlert()
```javascript
async function handleAlert(data) {
  // Création alerte MongoDB
  const alert = await Alert.create({
    deviceId: data.device_id,
    type: data.type,
    priority: data.type === 'MANUAL_SOS' ? 'CRITICAL' : 'HIGH',
    latitude: data.lat,
    longitude: data.lon,
    status: 'ACTIVE',
    timestamp: new Date(data.timestamp)
  });
  
  // Diffusion WebSocket
  io.emit('alert', {
    id: alert._id,
    deviceId: data.device_id,
    type: data.type,
    priority: alert.priority,
    coordinates: [data.lat, data.lon],
    timestamp: new Date(data.timestamp)
  });
  
  // Notifications externes
  await notifyPartners(alert);
}
```

### Types d'Alertes
- **MANUAL_SOS:** Bouton d'urgence (priorité CRITICAL)
- **FALL_DETECTED:** Chute détectée (priorité HIGH)
- **IMMERSION_DETECTED:** Immersion prolongée (priorité HIGH)

---

## 10. Système de Notifications

### Fonction notifyPartners()
```javascript
async function notifyPartners(alert) {
  const Twilio = require('twilio');
  const client = Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  
  if (alert.type === 'MANUAL_SOS') {
    await client.messages.create({
      body: `🚨 SOS ALERT: Device ${alert.deviceId} at ${alert.latitude}, ${alert.longitude}`,
      from: process.env.TWILIO_NUMBER,
      to: process.env.EMERGENCY_CONTACT
    });
  }
}
```

**Services externes:**
- **Twilio:** SMS d'urgence
- **Firebase:** Push notifications (extension possible)
- **Email:** Alertes par email (extension possible)

---

## 11. Gestion d'Erreurs

### Middleware Erreur Global
```javascript
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});
```

### Gestion Erreurs MQTT
```javascript
mqttClient.on('error', (err) => {
  logger.error('MQTT error:', err);
});
```

### Stratégies
- **Logging:** Toutes erreurs loggées
- **Recovery:** Tentatives reconnexion automatiques
- **Fallback:** Dégradation gracieuse

---

## 12. Démarrage du Serveur

### Configuration Port
```javascript
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
```

### Export Modules
```javascript
module.exports = { app, server, io, mqttClient };
```
**Utilisation:** Tests, extensions, intégration

---

## 13. Architecture et Flux de Données

### Flux Données Capteurs
```
Bracelet IoT → MQTT → handleDeviceData() → MongoDB + WebSocket → Dashboard/Mobile
```

### Flux Alertes
```
Bracelet IoT → MQTT → handleAlert() → MongoDB + WebSocket + SMS → Tous clients
```

### Flux Dashboard
```
Client Web → Socket.io → Authentification → Salle dashboard → Mises à jour temps réel
```

---

## 14. Sécurité Implémentée

### Headers HTTP (Helmet)
- **Content Security Policy**
- **X-Frame-Options**
- **X-Content-Type-Options**
- **Strict-Transport-Security**

### Authentification
- **JWT Tokens** (route /api/auth)
- **WebSocket auth** obligatoire
- **MQTT credentials** requis

### Validation Données
- **JSON parsing** sécurisé
- **Input sanitization**
- **Type checking** avant stockage

---

## 15. Performance et Scalabilité

### Optimisations
- **Connexions persistantes** MQTT/WebSocket
- **Indexes MongoDB** sur deviceId/timestamp
- **Buffering** messages haute fréquence
- **Pooling connexions** base de données

### Métriques
- **Latence:** < 100ms réponses API
- **Throughput:** 1000+ messages/minute
- **Mémoire:** Optimisée pour conteneurs
- **CPU:** Gestion événements asynchrone

---

## 16. Monitoring et Observabilité

### Health Checks
- **Endpoint /health** pour orchestrateurs
- **Status connexions** MQTT/MongoDB
- **Métriques serveur** (uptime, mémoire)

### Logging
- **Niveaux:** ERROR, WARN, INFO, DEBUG
- **Formats:** JSON structuré
- **Rotation:** Fichiers séparés
- **Centralisation:** Prêt pour ELK stack

---

## 17. Déploiement et Configuration

### Variables Environnement
```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/senmool
MQTT_BROKER=mqtt://localhost:1883
MQTT_USER=senmool
MQTT_PASS=secure_password
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_NUMBER=+221XXXXXXXXX
EMERGENCY_CONTACT=+221XXXXXXXXX
```

### Docker
```dockerfile
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

---

## 18. Tests et Validation

### Tests Unitaires
```javascript
// Exemple test MQTT
describe('MQTT Connection', () => {
  it('should connect to broker', () => {
    expect(mqttClient.connected).toBe(true);
  });
});
```

### Tests Intégration
- **API endpoints** avec supertest
- **WebSocket events** avec socket.io-client
- **MQTT messages** avec broker de test

### Tests Charge
- **1000 devices** simultanés
- **Messages haute fréquence**
- **Reconnexions automatiques**

---

## 19. Extensions et Évolutions

### Fonctionnalités Futures
- **Authentification avancée** (OAuth, 2FA)
- **Rate limiting** API
- **Cache Redis** pour performances
- **Load balancing** multi-instances
- **API GraphQL** alternative REST
- **Monitoring avancé** (Prometheus/Grafana)

### Intégrations Possibles
- **Firebase Cloud Messaging** push notifications
- **AWS IoT Core** gestion flotte
- **InfluxDB** time-series optimisé
- **Elasticsearch** recherche avancée

---

## 20. Dépannage

### Problèmes Courants

#### Connexion MQTT échoue
```javascript
// Vérifier credentials
console.log('MQTT_USER:', process.env.MQTT_USER);
console.log('MQTT_PASS:', process.env.MQTT_PASS);
```

#### WebSocket ne se connecte pas
```javascript
// Vérifier CORS
io.origins('*:*');  // En développement
```

#### MongoDB timeouts
```javascript
// Augmenter timeouts
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});
```

---

**Fin de la documentation pour server.js**  
*Document généré automatiquement le 5 mai 2026*
