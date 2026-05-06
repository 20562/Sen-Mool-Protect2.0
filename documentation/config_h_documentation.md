# Documentation du Code: config.h
## SEN-MOOL PROTECT 2.0 - Configuration Header File

**Fichier:** `/device/config.h`  
**Auteur:** GitHub Copilot  
**Date:** 5 mai 2026  
**Version:** 1.0.0  
**Langage:** C/C++ Header File  

---

## 1. Vue d'ensemble

Le fichier `config.h` est un fichier d'en-tête C/C++ qui centralise toutes les constantes de configuration du bracelet IoT SEN-MOOL PROTECT 2.0. Il utilise des directives `#define` pour définir des valeurs constantes utilisées dans le firmware principal.

Ce fichier permet de:
- Centraliser la configuration du dispositif
- Faciliter les modifications sans changer le code principal
- Maintenir la cohérence des paramètres
- Supporter différents environnements de déploiement

---

## 2. Structure du Fichier

### Garde d'Inclusion
```cpp
#ifndef CONFIG_H
#define CONFIG_H
...
#endif
```
Empêche les inclusions multiples du fichier d'en-tête.

---

## 3. Configuration du Dispositif

### Informations Générales
```cpp
#define DEVICE_NAME "MOOL-Safe Bracelet"
#define FIRMWARE_VERSION "1.0.0"
#define DEVICE_TYPE "WEARABLE_IOT"
```

- **DEVICE_NAME:** Nom d'affichage du bracelet
- **FIRMWARE_VERSION:** Version du firmware (format sémantique)
- **DEVICE_TYPE:** Type de dispositif pour identification

---

## 4. Configuration Réseau

### Activation des Interfaces
```cpp
#define ENABLE_WIFI true
#define ENABLE_GSM true
#define ENABLE_LORA true
```

- **ENABLE_WIFI:** Active la connectivité WiFi (ports, hôtels)
- **ENABLE_GSM:** Active le modem GSM/2G (fallback océan)
- **ENABLE_LORA:** Active le réseau mesh LoRa (équipe)

### Avantages de cette Configuration
- **Redondance:** Multiples chemins de communication
- **Adaptabilité:** Différents environnements marins
- **Fiabilité:** Fallback automatique en cas de panne

---

## 5. Configuration des Capteurs

### Activation des Capteurs
```cpp
#define HEART_RATE_ENABLED true
#define TEMPERATURE_ENABLED true
#define ACCELEROMETER_ENABLED true
#define IMMERSION_SENSOR_ENABLED true
```

Chaque capteur peut être activé/désactivé individuellement pour:
- **Tests de développement**
- **Économie d'énergie**
- **Configurations spécialisées**

---

## 6. Seuils de Sécurité

### Seuils Fréquence Cardiaque
```cpp
#define HEART_RATE_CRITICAL_HIGH 140  // bpm
#define HEART_RATE_CRITICAL_LOW 40    // bpm
```

- **CRITICAL_HIGH:** Tachycardie (stress, effort intense)
- **CRITICAL_LOW:** Bradycardie (hypothermie, fatigue)

### Seuil Température
```cpp
#define TEMPERATURE_MAX 40.0  // °C
```

Température corporelle maximale avant alerte.

### Seuils Détection
```cpp
#define FALL_DETECTION_THRESHOLD 3     // cycles consécutifs
#define IMMERSION_TIMEOUT 5000        // millisecondes
```

- **FALL_DETECTION_THRESHOLD:** Nombre de lectures consécutives sous seuil chute
- **IMMERSION_TIMEOUT:** Durée d'immersion avant alerte automatique

---

## 7. Configuration MQTT

### Topics de Base
```cpp
#define MQTT_TOPIC_DATA "mool/bracelet/{device_id}/data"
#define MQTT_TOPIC_ALERT "mool/alerts/{priority}"
#define MQTT_TOPIC_STATUS "mool/bracelet/{device_id}/status"
#define MQTT_TOPIC_COMMAND "mool/bracelet/{device_id}/command"
```

Templates de topics MQTT avec placeholders:
- **{device_id}:** Remplacé par l'ID unique du bracelet
- **{priority}:** Remplacé par "sos", "high", "medium", "low"

### Topics Résolus (Exemple)
Pour DEVICE_ID = "MOOL-001":
- `mool/bracelet/MOOL-001/data`
- `mool/alerts/sos`
- `mool/bracelet/MOOL-001/status`
- `mool/bracelet/MOOL-001/command`

---

## 8. Intervalles de Mise à Jour

### Fréquences d'Acquisition
```cpp
#define GPS_UPDATE_INTERVAL 5000      // 5 secondes
#define SENSOR_UPDATE_INTERVAL 2000   // 2 secondes
#define DATA_PUBLISH_INTERVAL 30000   // 30 secondes
#define HEARTBEAT_INTERVAL 60000      // 60 secondes
```

- **GPS_UPDATE_INTERVAL:** Fréquence mise à jour position
- **SENSOR_UPDATE_INTERVAL:** Fréquence lecture capteurs
- **DATA_PUBLISH_INTERVAL:** Fréquence envoi données MQTT
- **HEARTBEAT_INTERVAL:** Fréquence signal de vie

### Considérations Performance
- **Équilibre:** Entre réactivité et consommation batterie
- **Bande passante:** Limite trafic réseau
- **Précision:** Suffisant pour surveillance maritime

---

## 9. Configuration Batterie

### Seuils Voltage
```cpp
#define BATTERY_VOLTAGE_MIN 3.0       // Volts
#define BATTERY_VOLTAGE_MAX 4.2       // Volts
#define LOW_BATTERY_THRESHOLD 3.2     // Volts
```

- **BATTERY_VOLTAGE_MIN:** Tension minimale batterie LiPo
- **BATTERY_VOLTAGE_MAX:** Tension maximale chargée
- **LOW_BATTERY_THRESHOLD:** Seuil alerte batterie faible

### Calcul Niveau Batterie
```cpp
battery_level = ((voltage - BATTERY_VOLTAGE_MIN) /
                 (BATTERY_VOLTAGE_MAX - BATTERY_VOLTAGE_MIN)) * 100;
```

---

## 10. Configuration Réseau Mesh LoRa

### Paramètres RF
```cpp
#define LORA_FREQUENCY 868E6          // 868 MHz (Europe)
#define LORA_BANDWIDTH 125E3          // 125 kHz
#define LORA_SPREADING_FACTOR 7       // Facteur d'étalement
#define LORA_CODING_RATE 5            // Taux codage 4/5
#define LORA_TX_POWER 20              // Puissance transmission (dBm)
```

### Explication des Paramètres LoRa

#### Fréquence
- **868 MHz:** Bande ISM européenne pour applications IoT
- **Avantages:** Portée étendue, faible interférence

#### Bande Passante
- **125 kHz:** Bonne compromise portée/vitesse
- **Portée:** 2-5 km en visibilité directe

#### Facteur d'Étalement (SF)
- **SF=7:** Balance portée/vitesse
- **Plus élevé =** Plus de portée, moins de débit

#### Taux de Codage
- **4/5:** Fiabilité vs débit
- **Correction d'erreurs** automatique

#### Puissance Transmission
- **20 dBm:** Maximum légal en Europe
- **Portée:** Maximisée pour usage maritime

---

## 11. Utilisation dans le Code

### Inclusion dans main.ino
```cpp
#include "config.h"  // Au début du fichier
```

### Utilisation des Constantes
```cpp
// Au lieu de valeurs magiques
if (heartRate > HEART_RATE_CRITICAL_HIGH) {
    // Alerte tachycardie
}

// Avec les topics
String topic = String(MQTT_TOPIC_DATA);
topic.replace("{device_id}", DEVICE_ID);
```

---

## 12. Avantages de cette Architecture

### Maintenabilité
- **Centralisation:** Tous les paramètres en un endroit
- **Cohérence:** Valeurs utilisées de manière cohérente
- **Documentation:** Commentaires explicatifs

### Flexibilité
- **Environnements:** Configurations différentes (dev/prod)
- **Tests:** Valeurs ajustables pour tests
- **Évolution:** Nouveaux paramètres sans changer le code

### Sécurité
- **Validation:** Seuils de sécurité définis clairement
- **Limites:** Protection contre valeurs invalides
- **Monitoring:** Seuils pour alertes automatiques

---

## 13. Modifications Recommandées

### Pour Environnements Différents
```cpp
// Production
#define MQTT_SERVER "mqtt.senmool.sn"

// Développement
#define MQTT_SERVER "localhost"
```

### Ajustements Performance
```cpp
// Haute fréquence (tests)
#define DATA_PUBLISH_INTERVAL 5000

// Économie batterie (production)
#define DATA_PUBLISH_INTERVAL 60000
```

---

## 14. Validation Configuration

### Checklist Déploiement
- [ ] Fréquences compatibles avec la région
- [ ] Seuils adaptés à la population cible
- [ ] Topics MQTT cohérents avec le backend
- [ ] Intervalles équilibrés performance/énergie
- [ ] Paramètres LoRa conformes à la réglementation

---

## 15. Extensions Futures

### Nouveaux Paramètres Possibles
```cpp
#define ENABLE_BLUETOOTH false
#define GPS_TIMEOUT 10000
#define MAX_RECONNECT_ATTEMPTS 5
#define LOG_LEVEL 2  // 0=ERROR, 1=WARN, 2=INFO, 3=DEBUG
#define ALERT_DEBOUNCE_TIME 300000  // 5 minutes
```

### Configuration Dynamique
- **OTA Updates:** Modification à distance
- **Profils:** Configurations prédéfinies
- **Apprentissage:** Ajustement automatique des seuils

---

**Fin de la documentation pour config.h**  
*Document généré automatiquement le 5 mai 2026*
