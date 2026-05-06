# Documentation du Code: libraries.txt
## SEN-MOOL PROTECT 2.0 - Arduino Libraries Dependencies

**Fichier:** `/device/libraries.txt`  
**Auteur:** GitHub Copilot  
**Date:** 5 mai 2026  
**Version:** 1.0.0  
**Type:** Configuration des Dépendances Arduino  

---

## 1. Vue d'ensemble

Le fichier `libraries.txt` est un manifeste des librairies Arduino nécessaires pour compiler le firmware ESP32 du bracelet SEN-MOOL PROTECT 2.0. Il liste toutes les dépendances externes requises pour le fonctionnement du système IoT.

---

## 2. Librairies Requises

### 1. TinyGPS++
**Auteur:** Mikal Hart  
**Version:** Dernière stable  
**Installation:** Via Arduino Library Manager  
**Utilisation:** Parsing des données GPS NMEA 0183  

**Fonctionnalités utilisées:**
- Parsing coordonnées latitude/longitude
- Validation données GPS
- Extraction timestamp
- Gestion satellites

**Impact:** Essentiel pour le positionnement en temps réel

---

### 2. MAX30100 by OXullo Intersec
**Auteur:** OXullo Intersec  
**Version:** 1.0.0+  
**Installation:** Via Arduino Library Manager  
**Utilisation:** Capteur de fréquence cardiaque et SpO2  

**Fonctionnalités utilisées:**
- Mesure fréquence cardiaque (bpm)
- Détection pouls
- Filtrage bruit
- Calibration automatique

**Impact:** Surveillance santé cardiovasculaire

---

### 3. MPU6050 by Rui Santos
**Auteur:** Rui Santos  
**Version:** 1.0.0+  
**Installation:** Via Arduino Library Manager  
**Utilisation:** Accéléromètre et gyroscope 6DOF  

**Fonctionnalités utilisées:**
- Mesure accélération (x, y, z)
- Détection mouvements
- Calcul magnitude totale
- Filtrage vibrations

**Impact:** Détection automatique de chutes

---

### 4. DallasTemperature
**Auteur:** Miles Burton  
**Version:** 3.9.0+  
**Installation:** Via Arduino Library Manager  
**Utilisation:** Communication avec capteurs température OneWire  

**Fonctionnalités utilisées:**
- Lecture température DS18B20
- Gestion bus OneWire
- Résolution configurable
- Gestion multiple capteurs

**Impact:** Mesure température corporelle

---

### 5. OneWire
**Auteur:** Paul Stoffregen  
**Version:** 2.3.0+  
**Installation:** Via Arduino Library Manager  
**Utilisation:** Protocole de communication OneWire  

**Fonctionnalités utilisées:**
- Bus OneWire pour DS18B20
- Recherche appareils
- Communication half-duplex
- CRC validation

**Impact:** Interface température

---

### 6. PubSubClient by Nick O'Leary
**Auteur:** Nick O'Leary  
**Version:** 2.8.0+  
**Installation:** Via Arduino Library Manager  
**Utilisation:** Client MQTT pour ESP32  

**Fonctionnalités utilisées:**
- Connexion broker MQTT
- Publication/souscription topics
- Gestion reconnexion
- QoS levels
- Keep-alive

**Impact:** Communication temps réel avec backend

---

### 7. LoRa by Sandeep Mistry
**Auteur:** Sandeep Mistry  
**Version:** 0.8.0+  
**Installation:** Via Arduino Library Manager  
**Utilisation:** Communication LoRa pour réseau mesh  

**Fonctionnalités utilisées:**
- Transmission RF 868MHz
- Configuration fréquence/bande
- Gestion puissance TX
- Mode réception continue
- AES encryption (optionnel)

**Impact:** Réseau mesh maritime longue portée

---

## 3. Installation des Librairies

### Via Arduino IDE
1. Ouvrir Arduino IDE
2. Aller dans `Sketch > Include Library > Manage Libraries`
3. Rechercher chaque librairie par nom
4. Installer la version recommandée
5. Redémarrer Arduino IDE si nécessaire

### Vérification Installation
```cpp
// Dans le code, vérifier les includes
#include <TinyGPS++.h>        // ✓ Doit compiler
#include "MAX30100_PulseOximeter.h"  // ✓ Doit compiler
#include "MPU6050.h"          // ✓ Doit compiler
// ... autres includes
```

---

## 4. Versions Recommandées

| Librairie | Version Min | Version Testée | Compatibilité |
|-----------|-------------|----------------|---------------|
| TinyGPS++ | 1.0.0 | 1.0.2 | ESP32 ✓ |
| MAX30100 | 1.0.0 | 1.1.0 | ESP32 ✓ |
| MPU6050 | 1.0.0 | 1.0.1 | ESP32 ✓ |
| DallasTemperature | 3.9.0 | 3.9.1 | ESP32 ✓ |
| OneWire | 2.3.0 | 2.3.5 | ESP32 ✓ |
| PubSubClient | 2.8.0 | 2.8.1 | ESP32 ✓ |
| LoRa | 0.8.0 | 0.8.1 | ESP32 ✓ |

---

## 5. Dépannage Installation

### Erreur: "Library not found"
- Vérifier nom exact dans Library Manager
- Vérifier compatibilité ESP32
- Redémarrer Arduino IDE

### Erreur: "Version incompatible"
- Utiliser versions recommandées
- Vérifier changelog pour breaking changes
- Tester avec version précédente si nécessaire

### Erreur: "Compilation failed"
- Vérifier tous les includes présents
- Contrôler conflits de noms
- Vérifier board ESP32 sélectionnée

---

## 6. Alternatives et Forks

### TinyGPS++
- **Alternative:** NeoGPS (plus performant)
- **Avantages:** Mémoire optimisée, plus rapide

### PubSubClient
- **Alternative:** AsyncMQTT (asynchrone)
- **Avantages:** Non-bloquant, meilleures performances

### LoRa
- **Alternative:** RadioLib (plus moderne)
- **Avantages:** Support plus de modules, meilleures features

---

## 7. Impact Mémoire

### Utilisation RAM (approximatif)
- TinyGPS++: ~1KB
- MAX30100: ~2KB
- MPU6050: ~1KB
- DallasTemperature: ~500B
- OneWire: ~300B
- PubSubClient: ~4KB
- LoRa: ~8KB

**Total estimé:** ~17KB RAM utilisée

### Optimisations Possibles
- Utiliser versions allégées
- Désactiver features non utilisées
- Optimiser buffers MQTT

---

## 8. Maintenance et Mises à Jour

### Fréquence Mises à Jour
- **Sécurité:** Mises à jour critiques immédiatement
- **Features:** Nouvelles versions tous les 6 mois
- **Bug fixes:** Versions patch régulièrement

### Test Après Mise à Jour
- Compiler firmware
- Tester fonctionnalités principales
- Vérifier consommation mémoire
- Valider communication MQTT

---

## 9. Librairies Futures

### Potentielles Ajouts
- **WiFiManager:** Configuration WiFi automatique
- **ArduinoJson:** Parsing JSON avancé
- **Time:** Gestion temps NTP
- **SD_MMC:** Stockage local données
- **BluetoothSerial:** Debug wireless

### Conditions d'Intégration
- Compatibilité ESP32 prouvée
- Licence open source
- Maintenance active
- Impact mémoire acceptable

---

**Fin de la documentation pour libraries.txt**  
*Document généré automatiquement le 5 mai 2026*
