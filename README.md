# SEN-MOOL PROTECT 2.0
## Souveraineté Numérique & Économie Bleue — New Deal Technologique 2026

Système IoT maritime intégré pour protéger les travailleurs de la mer au Sénégal.

### Architecture Système

```
┌─────────────────────────────────────────────────────────────┐
│  BRACELET IoT (ESP32 + GPS + LoRa/GSM)                      │
│  • Détection immersion (5 sec)                               │
│  • Fréquence cardiaque, température                          │
│  • SOS manuel                                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │ LoRa Mesh / GSM / MQTT
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND NODE.js + MQTT Broker                              │
│  • Réception données bracelet                                │
│  • Alertes SOS temps réel                                    │
│  • WebSockets pour dashboard                                 │
│  • API REST pour app mobile                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
    MongoDB   Python ML   Dashboard
               Détection  Web/React
```

### 🎨 Maquette & Design

**Voir la maquette interactive du projet :**
[📱 Maquette SenMoolProtect 2.0 sur Readdy.ai](https://readdy.ai/project/20815d8a-034c-4c0c-8571-3bac81188637)

### Structure Projet

```
.
├── device/              # Firmware ESP32
│   ├── main.ino
│   ├── config.h
│   └── libraries.txt
│
├── backend/             # Serveur Node.js
│   ├── server.js
│   ├── package.json
│   ├── mqtt-handler.js
│   ├── api-routes.js
│   ├── models/
│   │   └── Alert.js
│   └── config/
│       └── database.js
│
├── app-mobile/          # Flutter / React Native
│   ├── pubspec.yaml     (Flutter)
│   └── src/
│       ├── screens/
│       └── widgets/
│
├── ml/                  # Python - Détection IA
│   ├── fall_detection.py
│   ├── anomaly_detection.py
│   └── requirements.txt
│
├── docs/                # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── MQTT_PROTOCOL.md
│
└── README.md
```

### Composants Clés

#### 1. **Bracelet IoT (device/)**
- **Microcontrôleur** : ESP32
- **Localisation** : GPS NEO-6M
- **Connectivité** : LoRa (RFM95W) + Modem GSM
- **Capteurs** : 
  - Accéléromètre (MPU6050) → Chute
  - Capteur fréquence cardiaque (MAX30100)
  - Capteur température DS18B20
  - Capteur immersion (humidité)
- **Batterie** : LiPo 3.7V 1500mAh

#### 2. **Backend (backend/)**
- **Framework** : Express.js
- **MQTT** : Mosquitto Broker (localhost:1883)
- **Base de données** : MongoDB
- **Communication temps réel** : WebSockets (Socket.io)
- **API** : REST + WebSocket

#### 3. **App Mobile (app-mobile/)**
- **Framework** : Flutter
- **Carte interactive** : Google Maps API
- **Communication** : WebSocket + MQTT
- **Géolocalisation** : GPS du téléphone

#### 4. **IA/ML (ml/)**
- **Python** 3.8+
- **Détection chute** : Données accéléromètre
- **Détection anomalie** : Fréquence cardiaque
- **Intégration** : Webhook → Node.js

### Flux Données

1. **SOS Manuel**
   - Utilisateur appuie → ESP32 détecte → MQTT → Node.js → MongoDB
   - WebSocket → Dashboard + App mobile
   - Envoi SMS/Email partenaires

2. **Détection Automatique**
   - Capteur immersion → ESP32 → LoRa Mesh → Node.js
   - Python vérifie pattern → Alerte si confirmée
   - WebSocket → Dashboard + App mobile

3. **Monitoring Continu**
   - Données tous les 30s (GPS, cœur, temp)
   - Stockage MongoDB
   - Analyse Python toutes les 5 min
   - Tableau bord temps réel

### Installation Rapide

```bash
# Backend
cd backend
npm install
npm start

# Python ML (optionnel)
cd ../ml
pip install -r requirements.txt
python fall_detection.py

# Firmware ESP32
# → Arduino IDE + libraries (voir device/libraries.txt)
# → Upload main.ino
```

### Variables Environnement (.env)

```
MQTT_BROKER=localhost
MQTT_PORT=1883
MONGODB_URI=mongodb://localhost:27017/senmool
MONGODB_USER=admin
MONGODB_PASS=***
NODE_ENV=production
PORT=3000
```

### Ports

- Backend API: `3000`
- MQTT Broker: `1883`
- MongoDB: `27017`
- WebSocket: `3000/socket.io`

### Partenaires Techniques

- **Primature** — Gouvernement
- **UNCHK** — Pôle STN/MIC
- **SENUM SA** — Cloud National
- **Marine Nationale du Sénégal**
- **PTN Diamniadio** — Fabrication

### Roadmap

- [x] Architecture système
- [ ] Firmware ESP32 complet
- [ ] Backend temps réel
- [ ] App mobile
- [ ] Python ML
- [ ] Tests intégration
- [ ] Déploiement production

### Licence

© 2026 SEN-MOOL PROTECT — Souveraineté Numérique & Économie Bleue
