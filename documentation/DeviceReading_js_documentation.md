# Documentation du Code: DeviceReading.js
## SEN-MOOL PROTECT 2.0 - Modèle MongoDB DeviceReading

**Fichier:** `/backend/models/DeviceReading.js`  
**Auteur:** GitHub Copilot  
**Date:** 5 mai 2026  
**Version:** 1.0.0  
**Langage:** JavaScript (Mongoose ODM)  

---

## 1. Vue d'ensemble

Le modèle `DeviceReading` définit la structure des documents de lectures capteurs dans MongoDB. Il stocke les données télémétriques temps réel des bracelets IoT avec une rétention de 30 jours via TTL automatique.

Ce modèle constitue la base de données historique pour l'analyse des tendances, le debugging, et l'optimisation du système de surveillance maritime.

---

## 2. Dépendances

```javascript
const mongoose = require('mongoose');
```

**Mongoose 7.0+** - ODM MongoDB avec validation et indexation

---

## 3. Schéma DeviceReading

### Structure Complète
```javascript
const deviceReadingSchema = new mongoose.Schema({
  // Identifiant appareil
  deviceId: { type: String, required: true, index: true },
  
  // Localisation GPS
  latitude: Number,
  longitude: Number,
  
  // Données physiologiques
  temperature: Number,
  heartRate: Number,
  
  // Accéléromètre
  accelerometer: {
    x: Number,
    y: Number,
    z: Number
  },
  
  // États système
  immersed: Boolean,
  batteryLevel: Number,
  signalStrength: Number,
  
  // Timestamp
  timestamp: { type: Date, default: Date.now, index: true }
});
```

---

## 4. Champs du Schéma

### deviceId
```javascript
deviceId: {
  type: String,
  required: true,
  index: true
}
```
- **Type:** String
- **Requis:** Oui
- **Index:** Oui (optimise recherches par appareil)
- **Exemple:** "MOOL-001", "BRACELET-045"

### Localisation GPS
```javascript
latitude: Number,
longitude: Number
```
- **Type:** Number (float 64-bit)
- **Précision:** 6 décimales
- **Format:** WGS84 standard
- **Unité:** Degrés décimaux
- **Exemple:** Dakar: lat 14.693425, lon -17.444061

### Données Physiologiques
```javascript
temperature: Number,  // Température corporelle (°C)
heartRate: Number     // Fréquence cardiaque (bpm)
```
- **Temperature:** Mesure DS18B20 (range: -55°C à +125°C)
- **HeartRate:** Calcul MAX30100 (range: 0-255 bpm)
- **Précision:** 1 décimale pour température, entier pour FC

### Accéléromètre
```javascript
accelerometer: {
  x: Number,  // Accélération axe X (m/s²)
  y: Number,  // Accélération axe Y (m/s²)
  z: Number   // Accélération axe Z (m/s²)
}
```
- **Structure:** Objet imbriqué
- **Range:** Typiquement -16g à +16g (MPU6050)
- **Utilisation:** Détection chutes, analyse mouvements
- **Fréquence:** 10Hz (configurable)

### États Système
```javascript
immersed: Boolean,        // État immersion eau
batteryLevel: Number,     // Niveau batterie (%)
signalStrength: Number    // Force signal (%)
```
- **immersed:** true = contact eau détecté
- **batteryLevel:** 0-100% (calculé voltage)
- **signalStrength:** Qualité connexion (WiFi/GSM/LoRa)

### Timestamp
```javascript
timestamp: {
  type: Date,
  default: Date.now,
  index: true
}
```
- **Auto-généré:** Date création document
- **Index:** Requêtes temporelles optimisées
- **TTL:** Expiration automatique 30 jours

---

## 5. Index et Performance

### Index Créés
```javascript
// Index deviceId (recherches par appareil)
deviceReadingSchema.index({ deviceId: 1 });

// Index timestamp (recherches temporelles)
deviceReadingSchema.index({ timestamp: 1 });

// TTL Index (suppression automatique)
deviceReadingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });
```

### TTL Configuration
```javascript
expireAfterSeconds: 2592000  // 30 jours = 30 * 24 * 3600
```
- **Rétention:** 30 jours données télémétriques
- **Auto-nettoyage:** Suppression automatique
- **Conformité:** RGPD, optimisation stockage

---

## 6. Méthodes et Requêtes

### Création Lecture
```javascript
const reading = new DeviceReading({
  deviceId: 'MOOL-001',
  latitude: 14.693425,
  longitude: -17.444061,
  temperature: 36.5,
  heartRate: 72,
  accelerometer: { x: 0.1, y: 0.2, z: 9.8 },
  immersed: false,
  batteryLevel: 85,
  signalStrength: 92
});

await reading.save();
```

### Requêtes Courantes

#### Dernière Position Appareil
```javascript
const latest = await DeviceReading.findOne({ deviceId: 'MOOL-001' })
  .sort({ timestamp: -1 });
```

#### Historique 24h
```javascript
const yesterday = new Date(Date.now() - 24 * 3600000);
const history = await DeviceReading.find({
  deviceId: 'MOOL-001',
  timestamp: { $gte: yesterday }
}).sort({ timestamp: -1 });
```

#### Statistiques Santé
```javascript
const stats = await DeviceReading.aggregate([
  { $match: { deviceId: 'MOOL-001', timestamp: { $gte: yesterday } } },
  { $group: { 
    _id: null,
    avgTemp: { $avg: '$temperature' },
    avgHR: { $avg: '$heartRate' },
    maxHR: { $max: '$heartRate' },
    minHR: { $min: '$heartRate' }
  }}
]);
```

#### Détection Tendances
```javascript
const trend = await DeviceReading.find({
  deviceId: 'MOOL-001',
  timestamp: { $gte: new Date(Date.now() - 3600000) } // 1h
}).sort({ timestamp: 1 });
```

---

## 7. Intégration Système

### Flux Données
```
Bracelet IoT → MQTT → server.js → DeviceReading.create() → MongoDB
                                      ↓
                               WebSocket broadcast → Dashboard temps réel
```

### Fréquence Acquisition
- **GPS:** Toutes les 5 secondes
- **Capteurs:** Toutes les 2 secondes
- **Publication:** Toutes les 30 secondes
- **Stockage:** Batch optimisé

---

## 8. Validation et Sécurité

### Validation Schéma
- **Required fields:** deviceId obligatoire
- **Type checking:** Types stricts
- **Range validation:** Valeurs réalistes

### Sanitization
- **Input cleaning:** Middleware Mongoose
- **Bounds checking:** Valeurs physiologiques
- **Null handling:** Champs optionnels

---

## 9. Performance et Optimisation

### Index Optimisés
- **deviceId:** Requêtes appareil (O(log n))
- **timestamp:** Requêtes temporelles (O(log n))
- **Compound:** deviceId + timestamp fréquents

### TTL Benefits
- **Storage:** ~2GB/mois pour 1000 appareils
- **Query speed:** Collections limitées
- **Backup:** Pas de données historiques massives

### Agrégations Optimisées
```javascript
// Index compound recommandé
deviceReadingSchema.index({ deviceId: 1, timestamp: -1 });
```

---

## 10. Analytics et Insights

### Métriques Calculées
```javascript
// Distance parcourue
const distance = await DeviceReading.aggregate([
  { $match: { deviceId: 'MOOL-001' } },
  { $sort: { timestamp: 1 } },
  { $group: { _id: null, positions: { $push: { lat: '$latitude', lon: '$longitude' } } } }
  // Calcul distance géodésique...
]);

// Zones à risque
const riskZones = await DeviceReading.aggregate([
  { $match: { immersed: true } },
  { $group: { _id: { lat: { $round: ['$latitude', 2] }, lon: { $round: ['$longitude', 2] } }, 
             count: { $sum: 1 } } }
]);
```

### Détection Anomalies
```javascript
// Fréquence cardiaque anormale
const anomalies = await DeviceReading.find({
  heartRate: { $lt: 40, $gt: 140 },
  timestamp: { $gte: new Date(Date.now() - 3600000) }
});
```

---

## 11. Export et API

### Endpoints Associés
- **GET /api/devices/:id** - Dernière lecture
- **GET /api/devices/:id/history** - Historique avec filtres

### Format JSON
```json
{
  "deviceId": "MOOL-001",
  "latitude": 14.693425,
  "longitude": -17.444061,
  "temperature": 36.5,
  "heartRate": 72,
  "accelerometer": {
    "x": 0.1,
    "y": 0.2,
    "z": 9.8
  },
  "immersed": false,
  "batteryLevel": 85,
  "signalStrength": 92,
  "timestamp": "2026-05-05T10:30:00Z"
}
```

---

## 12. Migration et Évolution

### Versionnement Schéma
```javascript
// Ajout champs futurs
deviceReadingSchema.add({
  altitude: Number,           // Altitude GPS (m)
  speed: Number,              // Vitesse (km/h)
  heading: Number,            // Direction (°)
  satellites: Number,         // Satellites GPS visibles
  firmwareVersion: String,    // Version firmware
  rssi: Number               // Signal WiFi/GSM (dBm)
});
```

### Migration Données
```javascript
// Script migration
const migrateReadings = async () => {
  const readings = await DeviceReading.find({ firmwareVersion: { $exists: false } });
  for (const reading of readings) {
    reading.firmwareVersion = '1.0.0';
    await reading.save();
  }
};
```

---

## 13. Monitoring et Alertes

### Métriques Système
- **Volume données:** Lectures/jour/appareil
- **Taux compression:** TTL effectif
- **Performance queries:** Latence moyenne
- **Storage utilisé:** Tendance croissance

### Alertes Automatiques
```javascript
// Batterie faible
const lowBattery = await DeviceReading.find({
  batteryLevel: { $lt: 20 },
  timestamp: { $gte: new Date(Date.now() - 3600000) }
});

// Perte signal
const lostSignal = await DeviceReading.find({
  signalStrength: { $lt: 10 },
  timestamp: { $gte: new Date(Date.now() - 1800000) }
});
```

---

## 14. Tests et Validation

### Tests Unitaires
```javascript
describe('DeviceReading Model', () => {
  it('should create valid reading', async () => {
    const reading = new DeviceReading({
      deviceId: 'TEST-001',
      latitude: 14.693425,
      longitude: -17.444061,
      temperature: 36.5,
      heartRate: 72
    });
    await expect(reading.validate()).resolves.toBeUndefined();
  });
  
  it('should enforce required fields', async () => {
    const reading = new DeviceReading({}); // deviceId manquant
    await expect(reading.validate()).rejects.toThrow();
  });
});
```

### Tests Performance
- **Insertion bulk:** 1000 lectures/seconde
- **Query latest:** < 10ms
- **Aggregation:** < 100ms pour 24h données

---

## 15. Dépannage

### Problèmes Courants

#### TTL ne fonctionne pas
```javascript
// Vérifier index
db.devicereadings.getIndexes()

// Recréer TTL index
db.devicereadings.createIndex(
  { timestamp: 1 }, 
  { expireAfterSeconds: 2592000 }
)
```

#### Recherches lentes
```javascript
// Analyser query
db.devicereadings.find({ deviceId: 'MOOL-001' })
  .sort({ timestamp: -1 })
  .limit(100)
  .explain('executionStats')
```

#### Mémoire pleine
```javascript
// Vérifier taille collection
db.devicereadings.stats()

// Forcer cleanup TTL
db.adminCommand({ setParameter: 1, ttlMonitorSleepSecs: 60 })
```

---

## 16. Extensions Futures

### Champs Avancés
```javascript
{
  // Géolocalisation enrichie
  altitude: Number,
  accuracy: Number,
  speed: Number,
  heading: Number,
  
  // Santé avancée
  spo2: Number,              // Saturation oxygène
  stressLevel: Number,       // Niveau stress (calculé)
  
  // Environnement
  ambientTemp: Number,       // Température ambiante
  humidity: Number,          // Humidité
  
  // Système
  cpuTemp: Number,           // Température CPU ESP32
  memoryFree: Number,        // RAM disponible
  wifiStrength: Number,      // Force WiFi (dBm)
  
  // Métadonnées
  firmwareVersion: String,
  configVersion: String,
  sessionId: String
}
```

### Fonctionnalités ML
- **Prédiction santé:** Analyse tendances
- **Détection anomalies:** Modèles IA
- **Classification activité:** Marche, course, repos
- **Prévention:** Alertes prédictives

---

**Fin de la documentation pour DeviceReading.js**  
*Document généré automatiquement le 5 mai 2026*
