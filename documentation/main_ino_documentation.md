# Documentation du Code: main.ino
## SEN-MOOL PROTECT 2.0 - Firmware ESP32 Bracelet Maritime IoT

**Fichier:** `/device/main.ino`  
**Auteur:** GitHub Copilot  
**Date:** 5 mai 2026  
**Version:** 1.0.0  
**Langage:** Arduino/C++ pour ESP32  

---

## 1. Vue d'ensemble

Ce fichier constitue le firmware principal du bracelet IoT SEN-MOOL PROTECT 2.0. Il contrôle un ESP32 qui intègre plusieurs capteurs pour la surveillance maritime des pêcheurs. Le système détecte automatiquement les chutes, l'immersion, surveille les signes vitaux et permet l'activation manuelle d'alertes SOS.

### Fonctionnalités principales:
- **Positionnement GPS** en temps réel
- **Détection de chute** automatique via accéléromètre
- **Surveillance cardiaque** (fréquence cardiaque)
- **Mesure de température** corporelle
- **Détection d'immersion** dans l'eau
- **Bouton SOS** manuel avec feedback audio/visuel
- **Communication MQTT** pour transmission des données
- **Connectivité WiFi/GSM** avec fallback

---

## 2. Dépendances et Librairies

```cpp
#include <Wire.h>              // Communication I2C
#include <SPI.h>               // Communication SPI (pour LoRa)
#include <TinyGPS++.h>         // Parsing des données GPS
#include <HardwareSerial.h>    // Ports série ESP32
#include "MAX30100_PulseOximeter.h"  // Capteur fréquence cardiaque
#include "MPU6050.h"           // Accéléromètre/Gyroscope
#include <OneWire.h>           // Bus OneWire (température)
#include <DallasTemperature.h> // Capteur température DS18B20
#include <PubSubClient.h>      // Client MQTT
#include <WiFi.h>              // WiFi ESP32
```

---

## 3. Configuration des Pins

```cpp
// GPS Module
#define GPS_RX 16
#define GPS_TX 17

// GSM Module
#define GSM_RX 26
#define GSM_TX 27

// Capteurs
#define ONE_WIRE_BUS 25       // Température DS18B20

// LoRa Module (RFM95W)
#define LORA_SS 5
#define LORA_RST 14
#define LORA_DIO0 2

// Interface utilisateur
#define BUTTON_SOS 12         // Bouton d'urgence
#define LED_SOS 13            // LED d'alerte
#define BUZZER 4              // Buzzer audio
```

---

## 4. Configuration Réseau

```cpp
const char* SSID = "MoolNetwork";
const char* PASSWORD = "***";           // Mot de passe WiFi
const char* MQTT_SERVER = "mqtt.senmool.sn";
const int MQTT_PORT = 1883;
const char* DEVICE_ID = "MOOL-001";     // Identifiant unique du bracelet
```

---

## 5. Variables Globales

### Structure des Données Capteurs
```cpp
struct SensorData {
  float latitude;           // Latitude GPS
  float longitude;          // Longitude GPS
  float temperature;        // Température corporelle (°C)
  int heartRate;            // Fréquence cardiaque (bpm)
  float accelX, accelY, accelZ;  // Accélération (m/s²)
  bool immersed;            // État d'immersion
  unsigned long timestamp;  // Timestamp (millisecondes)
} currentData;
```

### Variables d'État
```cpp
bool sosActivated = false;              // État du bouton SOS
int fallDetectionCounter = 0;           // Compteur détection chute
const int FALL_THRESHOLD = 3;           // Seuil détection chute
const int IMMERSION_THRESHOLD = 1000;  // Seuil immersion (ms)
```

---

## 6. Fonction setup()

La fonction `setup()` initialise tous les composants matériels et logiciels:

### Initialisation Série
```cpp
Serial.begin(115200);                    // Moniteur série
gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);  // GPS
gsmSerial.begin(9600, SERIAL_8N1, GSM_RX, GSM_TX);  // GSM
```

### Configuration des Pins
```cpp
pinMode(BUTTON_SOS, INPUT_PULLUP);      // Bouton avec résistance pull-up
pinMode(LED_SOS, OUTPUT);               // LED en sortie
pinMode(BUZZER, OUTPUT);                // Buzzer en sortie
```

### Initialisation des Capteurs I2C
```cpp
Wire.begin();                           // Bus I2C
if (!mpu.begin()) {                     // Accéléromètre MPU6050
  Serial.println("MPU6050 NOT FOUND");
}
if (!heartRate.begin()) {               // Capteur MAX30100
  Serial.println("MAX30100 NOT FOUND");
}
```

### Initialisation Température
```cpp
sensors.begin();                        // Bus OneWire
```

### Connexion Réseau
```cpp
connectWiFi();                          // Connexion WiFi
mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
mqttClient.setCallback(onMqttMessage);
connectMQTT();                          // Connexion MQTT
```

---

## 7. Fonction loop()

La boucle principale s'exécute en continu et gère toutes les fonctionnalités:

### Maintenance Connexion MQTT
```cpp
if (!mqttClient.connected()) {
  if (!connectMQTT()) {
    delay(5000);
    return;
  }
}
mqttClient.loop();  // Traitement messages MQTT entrants
```

### Vérification Bouton SOS
```cpp
if (digitalRead(BUTTON_SOS) == LOW) {
  sosActivated = true;
  triggerSOS();  // Activation alerte d'urgence
}
```

### Lecture GPS
```cpp
while (gpsSerial.available()) {
  gps.encode(gpsSerial.read());  // Parsing données NMEA
}
if (gps.location.isUpdated()) {
  currentData.latitude = gps.location.lat();
  currentData.longitude = gps.location.lng();
}
```

### Lecture Fréquence Cardiaque
```cpp
if (heartRate.available()) {
  currentData.heartRate = heartRate.getHeartRate();
}
```

### Lecture Température
```cpp
sensors.requestTemperatures();
currentData.temperature = sensors.getTempCByIndex(0);
```

### Détection de Chute
```cpp
mpu.getAcceleration(&currentData.accelX, &currentData.accelY, &currentData.accelZ);
detectFall();  // Analyse accélération
```

### Détection d'Immersion
```cpp
currentData.immersed = analogRead(A0) > IMMERSION_THRESHOLD;
if (currentData.immersed) {
  handleImmersion();  // Gestion immersion prolongée
}
```

### Publication des Données
```cpp
static unsigned long lastPublish = 0;
if (millis() - lastPublish > 30000) {  // Toutes les 30 secondes
  publishData();
  lastPublish = millis();
}
```

---

## 8. Fonctions Utilitaires

### connectWiFi()
Établit la connexion WiFi avec retry automatique:
- Mode station (STA)
- Timeout après 20 tentatives
- Fallback vers GSM si échec

### connectMQTT()
Connexion au broker MQTT:
- Utilise DEVICE_ID comme client ID
- S'abonne aux commandes distantes
- Publie statut "online"

### publishData()
Envoie les données capteurs au broker:
```json
{
  "id": "MOOL-001",
  "lat": 14.693425,
  "lon": -17.444061,
  "temp": 36.5,
  "hr": 72,
  "accel": [0.1, 0.2, 9.8],
  "immersed": false,
  "ts": 1234567890
}
```

### triggerSOS()
Gère l'alerte SOS manuelle:
- Active LED et buzzer
- Publie alerte sur topic "mool/alerts/sos"
- Feedback visuel/audio pendant 1 seconde

### detectFall()
Algorithme de détection de chute:
- Calcule magnitude accélération totale
- Seuil chute libre: < 5.0 m/s²
- Compteur sur 3 cycles consécutifs
- Reset automatique si mouvement normal

### handleImmersion()
Gestion immersion prolongée:
- Timer 5 secondes d'immersion continue
- Déclenche alerte automatique
- Reset timer après alerte

### publishAlert()
Publication alertes automatiques:
- Types: FALL_DETECTED, IMMERSION_DETECTED
- Inclut position GPS et données capteurs
- Feedback buzzer court

### onMqttMessage()
Callback MQTT pour commandes distantes:
- Affiche messages reçus
- Prêt pour extension commandes

---

## 9. Protocoles de Communication

### MQTT Topics
- **Publication:** `mool/bracelet/{DEVICE_ID}/data` - Données capteurs
- **Publication:** `mool/bracelet/{DEVICE_ID}/status` - Statut device
- **Publication:** `mool/alerts/sos` - Alertes SOS manuelles
- **Publication:** `mool/alerts/automatic` - Alertes automatiques
- **Abonnement:** `mool/bracelet/+/command` - Commandes distantes

### Format JSON Données
```json
{
  "id": "string",           // ID bracelet
  "lat": number,            // Latitude
  "lon": number,            // Longitude
  "temp": number,           // Température °C
  "hr": number,             // Fréquence cardiaque bpm
  "accel": [x,y,z],         // Accélération m/s²
  "immersed": boolean,      // État immersion
  "ts": number              // Timestamp ms
}
```

---

## 10. Gestion d'Énergie

### Modes de Fonctionnement
- **Actif:** Lecture continue tous les 100ms
- **Publication:** Toutes les 30 secondes
- **Heartbeat:** Statut toutes les minutes
- **Autonomie:** 72h en mode actif

### Optimisations
- Buffering données avant transmission
- Connexion MQTT persistante
- Sleep modes pour capteurs non utilisés

---

## 11. Sécurité et Fiabilité

### Redondance Connexion
- WiFi primaire (port/hôtel)
- GSM fallback (océan)
- LoRa mesh (équipe)

### Validation Données
- Vérification capteurs à l'initialisation
- Retry automatique connexions
- Timeout sécurisés

### Gestion Erreurs
- Logs série détaillés
- États fallback
- Reset automatique

---

## 12. Débogage et Maintenance

### Logs Série
- Initialisation composants
- Statut connexions
- Valeurs capteurs
- Alertes déclenchées

### Points de Test
- Bouton SOS → LED + buzzer + MQTT
- Chute simulée → alerte automatique
- Immersion → timer 5s → alerte
- Perte WiFi → fallback GSM

---

## 13. Extensions Futures

### Améliorations Possibles
- **LoRa intégration** complète
- **Compression données** pour économie bande passante
- **OTA updates** firmware
- **Configuration distante** via MQTT
- **Batterie monitoring** avancé
- **Multi-langues** messages audio

### Nouvelles Fonctionnalités
- **Géofencing** zones dangereuses
- **Communication peer-to-peer** entre bracelets
- **Historique local** en cas de perte connexion
- **Mode économie** batterie configurable

---

**Fin de la documentation pour main.ino**  
*Document généré automatiquement le 5 mai 2026*
