# Documentation du Code: Alert.js
## SEN-MOOL PROTECT 2.0 - Modèle MongoDB Alert

**Fichier:** `/backend/models/Alert.js`  
**Auteur:** GitHub Copilot  
**Date:** 5 mai 2026  
**Version:** 1.0.0  
**Langage:** JavaScript (Mongoose ODM)  

---

## 1. Vue d'ensemble

Le modèle `Alert` définit la structure des documents d'alertes dans la base de données MongoDB. Il utilise Mongoose pour créer un schéma structuré avec validation, indexation et fonctionnalités avancées comme l'expiration automatique (TTL).

Ce modèle gère tous les types d'alertes générées par le système : urgences manuelles, détections automatiques, anomalies physiologiques.

---

## 2. Dépendances

```javascript
const mongoose = require('mongoose');
```

**Mongoose 7.0+** - Object Document Mapper pour MongoDB

---

## 3. Schéma Alert

### Structure Complète
```javascript
const alertSchema = new mongoose.Schema({
  // Identifiant et classification
  deviceId: { type: String, required: true, index: true },
  type: { type: String, enum: [...], required: true },
  priority: { type: String, enum: [...], default: 'HIGH' },
  
  // Localisation
  latitude: Number,
  longitude: Number,
  
  // Données capteurs
  temperature: Number,
  heartRate: Number,
  
  // Gestion statut
  status: { type: String, enum: [...], default: 'ACTIVE' },
  acknowledgedBy: String,
  acknowledgedAt: Date,
  resolvedAt: Date,
  
  // Métadonnées
  notes: String,
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

### type
```javascript
type: {
  type: String,
  enum: ['MANUAL_SOS', 'IMMERSION_DETECTED', 'FALL_DETECTED', 'ABNORMAL_HEART_RATE', 'LOW_BATTERY'],
  required: true
}
```
**Types d'alertes:**
- **MANUAL_SOS:** Bouton d'urgence pressé
- **IMMERSION_DETECTED:** Immersion > 5 secondes
- **FALL_DETECTED:** Chute détectée par accéléromètre
- **ABNORMAL_HEART_RATE:** Fréquence cardiaque hors normes
- **LOW_BATTERY:** Batterie faible (< 3.2V)

### priority
```javascript
priority: {
  type: String,
  enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  default: 'HIGH'
}
```
**Niveaux de priorité:**
- **LOW:** Information (batterie faible)
- **MEDIUM:** Surveillance (anomalie légère)
- **HIGH:** Action requise (chute, immersion)
- **CRITICAL:** Urgence vitale (SOS manuel)

### Localisation GPS
```javascript
latitude: Number,
longitude: Number
```
- **Type:** Number (float)
- **Précision:** 6 décimales
- **Format:** WGS84
- **Exemple:** latitude: 14.693425, longitude: -17.444061

### Données Physiologiques
```javascript
temperature: Number,  // °C (corporelle)
heartRate: Number     // bpm
```
- **Temperature:** Mesure DS18B20 (36.0-40.0°C normal)
- **HeartRate:** Fréquence cardiaque (60-100 bpm normal)

### Gestion du Cycle de Vie
```javascript
status: {
  type: String,
  enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'FALSE_ALARM'],
  default: 'ACTIVE'
}
```
**États possibles:**
- **ACTIVE:** Alerte active, nécessite attention
- **ACKNOWLEDGED:** Reconnue par opérateur
- **RESOLVED:** Problème résolu
- **FALSE_ALARM:** Fausse alerte

### Métadonnées Opérationnelles
```javascript
acknowledgedBy: String,  // ID opérateur
acknowledgedAt: Date,    // Timestamp reconnaissance
resolvedAt: Date,        // Timestamp résolution
notes: String           // Commentaires résolution
```

### Timestamp
```javascript
timestamp: {
  type: Date,
  default: Date.now,
  index: true
}
```
- **Auto-généré:** Date.now() à la création
- **Index:** Optimise recherches temporelles
- **TTL:** Expiration automatique

---

## 5. Index et Performance

### Index Créés
```javascript
// Index deviceId (recherches par appareil)
alertSchema.index({ deviceId: 1 });

// Index timestamp (recherches temporelles)
alertSchema.index({ timestamp: 1 });

// TTL Index (suppression automatique)
alertSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });
```

### TTL (Time To Live)
```javascript
expireAfterSeconds: 7776000  // 90 jours = 90 * 24 * 3600
```
- **Auto-suppression:** Documents supprimés automatiquement
- **Économie stockage:** Historique limité
- **Conformité:** Rétention données réglementée

---

## 6. Méthodes d'Instance

### Méthodes Disponibles
```javascript
// Création
const alert = new Alert({ deviceId: 'MOOL-001', type: 'MANUAL_SOS' });

// Sauvegarde
await alert.save();

// Recherche
const activeAlerts = await Alert.find({ status: 'ACTIVE' });

// Mise à jour
await Alert.findByIdAndUpdate(alertId, { status: 'RESOLVED' });
```

### Validation Automatique
- **Required fields** vérifiés avant sauvegarde
- **Enum values** validées
- **Type checking** automatique

---

## 7. Requêtes Courantes

### Alertes Actives
```javascript
const activeAlerts = await Alert.find({ status: 'ACTIVE' })
  .sort({ timestamp: -1 })
  .limit(100);
```

### Alertes par Appareil
```javascript
const deviceAlerts = await Alert.find({ deviceId: 'MOOL-001' })
  .sort({ timestamp: -1 })
  .limit(50);
```

### Alertes par Type
```javascript
const sosAlerts = await Alert.find({ type: 'MANUAL_SOS' })
  .sort({ timestamp: -1 });
```

### Statistiques
```javascript
const stats = await Alert.aggregate([
  { $group: { _id: '$type', count: { $sum: 1 } } }
]);
```

---

## 8. Intégration Système

### Flux Création Alerte
```
1. Événement MQTT reçu
2. Validation données
3. Création document Alert
4. Diffusion WebSocket
5. Notification SMS (SOS)
6. Stockage MongoDB
```

### Gestion Cycle de Vie
```
ACTIVE → ACKNOWLEDGED → RESOLVED/FALSE_ALARM
   ↓           ↓              ↓
  SMS       Opérateur     Résolution
```

---

## 9. Sécurité et Validation

### Validation Schéma
- **Enum constraints:** Valeurs autorisées uniquement
- **Required fields:** Champs obligatoires
- **Type validation:** Types de données stricts

### Sanitization
- **Input cleaning:** Via middleware Mongoose
- **XSS protection:** Échappement automatique
- **Injection prevention:** Validation stricte

---

## 10. Performance et Optimisation

### Index Optimisés
- **deviceId:** Requêtes par appareil (O(log n))
- **timestamp:** Requêtes temporelles (O(log n))
- **Compound indexes:** Combinaisons fréquentes

### TTL Management
- **Auto-cleanup:** Pas de maintenance manuelle
- **Storage efficient:** Pas de données obsolètes
- **Query fast:** Collections plus petites

---

## 11. Migration et Évolution

### Ajout Champs
```javascript
// Version future
alertSchema.add({
  batteryLevel: Number,
  signalStrength: Number,
  firmwareVersion: String
});
```

### Changement Enum
```javascript
// Nouveaux types d'alertes
enum: ['MANUAL_SOS', 'IMMERSION_DETECTED', 'FALL_DETECTED', 
       'ABNORMAL_HEART_RATE', 'LOW_BATTERY', 'GEOFENCE_BREACH']
```

---

## 12. Monitoring et Métriques

### KPIs Trackés
- **Volume alertes:** Par jour/semaine/mois
- **Temps réponse:** ACKNOWLEDGED → RESOLVED
- **Taux faux positifs:** FALSE_ALARM %
- **Couverture temporelle:** Disponibilité système

### Requêtes Métriques
```javascript
// Alertes par jour (7 derniers jours)
const dailyStats = await Alert.aggregate([
  { $match: { timestamp: { $gte: new Date(Date.now() - 7*24*3600000) } } },
  { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, 
             count: { $sum: 1 } } }
]);
```

---

## 13. Export et API

### Endpoints Associés
- **GET /api/alerts** - Liste alertes
- **GET /api/alerts/active** - Alertes actives
- **PATCH /api/alerts/:id/status** - Mise à jour statut
- **GET /api/alerts/device/:id** - Alertes par appareil

### Format JSON API
```json
{
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "deviceId": "MOOL-001",
  "type": "MANUAL_SOS",
  "priority": "CRITICAL",
  "latitude": 14.693425,
  "longitude": -17.444061,
  "status": "ACTIVE",
  "timestamp": "2026-05-05T10:30:00Z"
}
```

---

## 14. Tests et Validation

### Tests Unitaires
```javascript
describe('Alert Model', () => {
  it('should create valid alert', async () => {
    const alert = new Alert({
      deviceId: 'TEST-001',
      type: 'MANUAL_SOS'
    });
    await expect(alert.validate()).resolves.toBeUndefined();
  });
  
  it('should reject invalid type', async () => {
    const alert = new Alert({
      deviceId: 'TEST-001',
      type: 'INVALID_TYPE'
    });
    await expect(alert.validate()).rejects.toThrow();
  });
});
```

### Tests Intégration
- **CRUD operations** complètes
- **TTL expiration** vérifiée
- **Index performance** mesurée
- **Concurrency** testée

---

## 15. Dépannage

### Problèmes Courants

#### TTL ne fonctionne pas
```javascript
// Vérifier index TTL
db.alerts.getIndexes()

// Recréer si nécessaire
db.alerts.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 })
```

#### Validation échoue
```javascript
// Vérifier enum values
const validTypes = ['MANUAL_SOS', 'IMMERSION_DETECTED', ...];
console.log('Type valide?', validTypes.includes(alert.type));
```

#### Recherches lentes
```javascript
// Vérifier indexes
db.alerts.getIndexes()

// Analyser query
db.alerts.find({ deviceId: 'MOOL-001' }).explain('executionStats')
```

---

## 16. Extensions Futures

### Champs Additionnels Possibles
```javascript
{
  // Géolocalisation avancée
  altitude: Number,
  accuracy: Number,
  geofence: String,
  
  // Contexte environnemental
  weather: String,
  seaState: String,
  
  // Métadonnées opérateur
  operatorId: String,
  responseTime: Number,
  resolutionNotes: String,
  
  // Intégrations
  smsSent: Boolean,
  pushSent: Boolean,
  emailSent: Boolean
}
```

### Fonctionnalités Avancées
- **Geofencing:** Alertes zones dangereuses
- **Escalation:** Règles automatisation
- **Analytics:** Tendances et prédictions
- **ML Integration:** Classification automatique

---

**Fin de la documentation pour Alert.js**  
*Document généré automatiquement le 5 mai 2026*
