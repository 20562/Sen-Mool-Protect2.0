# Documentation du Code: package.json
## SEN-MOOL PROTECT 2.0 - Backend Dependencies Configuration

**Fichier:** `/backend/package.json`  
**Auteur:** GitHub Copilot  
**Date:** 5 mai 2026  
**Version:** 1.0.0  
**Type:** Configuration npm/Node.js  

---

## 1. Vue d'ensemble

Le fichier `package.json` définit la configuration du projet Node.js pour le backend SEN-MOOL PROTECT 2.0. Il spécifie les métadonnées du projet, les scripts de gestion, et toutes les dépendances nécessaires au fonctionnement du serveur.

---

## 2. Métadonnées du Projet

### Informations Générales
```json
{
  "name": "senmool-backend",
  "version": "1.0.0",
  "description": "SEN-MOOL PROTECT 2.0 Backend - IoT Maritime Safety",
  "main": "server.js",
  "keywords": ["IoT", "MQTT", "Maritime", "Safety"],
  "author": "SEN-MOOL",
  "license": "MIT"
}
```

- **name:** Identifiant unique npm
- **version:** Version sémantique (MAJOR.MINOR.PATCH)
- **description:** Description fonctionnelle
- **main:** Point d'entrée de l'application
- **keywords:** Mots-clés pour découverte
- **author:** Propriétaire du projet
- **license:** Licence open source MIT

---

## 3. Scripts npm

### Scripts Disponibles
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  }
}
```

#### start
```bash
npm start
# Production: Lance le serveur avec Node.js standard
```

#### dev
```bash
npm run dev
# Développement: Lance avec nodemon (auto-restart)
```

#### test
```bash
npm test
# Tests: Exécute la suite de tests Jest
```

---

## 4. Dépendances Runtime

### Framework Web
```json
"express": "^4.18.2"
```
**Express.js 4.18+**
- Framework web minimaliste
- Routing, middleware
- API REST complète

### Temps Réel
```json
"socket.io": "^4.6.1"
```
**Socket.io 4.6+**
- WebSocket bidirectionnel
- Événements temps réel
- Compatibilité fallback

### Communication IoT
```json
"mqtt": "^5.0.0"
```
**MQTT.js 5.0+**
- Client MQTT complet
- Protocole IoT standard
- QoS, persistence, sécurité

### Base de Données
```json
"mongoose": "^7.0.0"
```
**Mongoose 7.0+**
- ODM MongoDB
- Schémas, validation
- Middleware, plugins

### Sécurité
```json
"helmet": "^7.0.0"
```
**Helmet 7.0+**
- Headers de sécurité HTTP
- Protection XSS, clickjacking
- CSP, HSTS

```json
"cors": "^2.8.5"
```
**CORS 2.8+**
- Cross-Origin Resource Sharing
- Configuration origines autorisées

### Authentification
```json
"jsonwebtoken": "^9.0.0"
```
**jsonwebtoken 9.0+**
- Génération/validation JWT
- Authentification stateless

```json
"bcryptjs": "^2.4.3"
```
**bcryptjs 2.4+**
- Hashage mots de passe
- Fonction de dérivation sécurisée

### Utilitaires
```json
"dotenv": "^16.0.3"
```
**dotenv 16.0+**
- Variables d'environnement
- Configuration sécurisée

```json
"winston": "^3.8.2"
```
**Winston 3.8+**
- Logging structuré
- Niveaux, transports multiples
- Rotation fichiers

### Validation
```json
"joi": "^17.9.1"
```
**Joi 17.9+**
- Validation schémas
- Sanitization input
- Messages d'erreur

### HTTP Client
```json
"axios": "^1.3.2"
```
**Axios 1.3+**
- Requêtes HTTP
- Interception, timeout
- Réponses promises

### Notifications
```json
"twilio": "^3.75.0"
```
**Twilio 3.75+**
- API SMS/voix
- Notifications d'urgence

### Gestion Erreurs
```json
"express-async-handler": "^1.2.0"
```
**express-async-handler 1.2+**
- Gestion erreurs async/await
- Middleware automatique

---

## 5. Dépendances Développement

### Outil Développement
```json
"nodemon": "^2.0.20"
```
**nodemon 2.0+**
- Surveillance fichiers
- Redémarrage automatique
- Développement efficace

### Framework Tests
```json
"jest": "^29.5.0"
```
**Jest 29.5+**
- Tests unitaires/intégration
- Assertions, mocks
- Rapports couverture

---

## 6. Gestion Versions

### Versionnage Sémantique
- **^4.18.2:** Compatible avec 4.x.x (mises à jour mineures/patch)
- **~2.0.20:** Compatible avec 2.0.x (mises à jour patch uniquement)
- **Exact versions** pour devDependencies

### Mise à Jour
```bash
# Vérifier vulnérabilités
npm audit

# Mettre à jour dépendances
npm update

# Mise à jour majeure (attention breaking changes)
npm install express@latest
```

---

## 7. Installation et Configuration

### Installation Dépendances
```bash
# Installer toutes dépendances
npm install

# Installation production uniquement
npm ci --production

# Installation avec cache
npm install --cache /tmp/npm-cache
```

### Variables Environnement
Créer `.env` basé sur `.env.example`:
```bash
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/senmool
MQTT_BROKER=mqtt://localhost:1883
JWT_SECRET=your-secret-key
TWILIO_SID=your-twilio-sid
```

---

## 8. Structure Dépendances

### Arbre Dépendances (simplifié)
```
senmool-backend/
├── express/
│   ├── accepts/
│   ├── array-flatten/
│   └── ... (20+ dépendances)
├── socket.io/
│   ├── engine.io/
│   ├── socket.io-parser/
│   └── ... (15+ dépendances)
├── mongoose/
│   ├── mongodb/
│   ├── mpath/
│   └── ... (25+ dépendances)
└── ... (autres paquets)
```

### Taille Bundle
- **Dependencies:** ~150 paquets
- **Taille disque:** ~50MB (node_modules)
- **Bundle production:** ~15MB

---

## 9. Sécurité Dépendances

### Audit Sécurité
```bash
# Vérifier vulnérabilités
npm audit

# Audit détaillé
npm audit --audit-level=moderate

# Corriger automatiquement
npm audit fix
```

### Dépendances Sûres
- **Snyk:** Monitoring vulnérabilités
- **npm audit:** Vérifications intégrées
- **Dependabot:** Mises à jour automatiques GitHub

---

## 10. Optimisations Performance

### Bundle Analysis
```bash
# Analyser taille bundle
npx webpack-bundle-analyzer

# Lister dépendances lourdes
npm ls --depth=0 | head -20
```

### Optimisations
- **Tree shaking** avec Webpack
- **Dependencies production** uniquement
- **Lazy loading** modules
- **Caching** layers

---

## 11. Tests et Qualité

### Configuration Jest
```javascript
// jest.config.js (implicite)
{
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.js', '!node_modules/**'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

### Scripts Test
```bash
# Tests unitaires
npm test

# Tests avec couverture
npm test -- --coverage

# Tests watch mode
npm test -- --watch
```

---

## 12. Déploiement

### Build Production
```bash
# Installer production uniquement
npm ci --production

# Vérifier build
npm run build  # si script ajouté

# Démarrer production
npm start
```

### Docker Optimisations
```dockerfile
# Multi-stage build recommandé
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 13. Maintenance

### Mise à Jour Régulière
```bash
# Vérifier outdated
npm outdated

# Mettre à jour spécifiques
npm update express socket.io

# Audit sécurité mensuel
npm audit fix
```

### Nettoyage
```bash
# Supprimer node_modules
rm -rf node_modules

# Clear cache npm
npm cache clean --force

# Réinstaller propre
npm install
```

---

## 14. Dépannage

### Problèmes Courants

#### ENOTFOUND registry.npmjs.org
```bash
# Vérifier connexion
ping registry.npmjs.org

# Changer registry
npm config set registry https://registry.npmjs.org/
```

#### EACCES permission denied
```bash
# Corriger permissions
sudo chown -R $(whoami) ~/.npm
```

#### Module not found
```bash
# Réinstaller dépendances
rm -rf node_modules package-lock.json
npm install
```

---

## 15. Extensions Futures

### Dépendances Potentielles
```json
{
  "redis": "^4.0.0",           // Cache haute performance
  "graphql": "^16.0.0",        // API GraphQL
  "passport": "^0.6.0",        // Authentification avancée
  "rate-limiter-flexible": "^3.0.0",  // Rate limiting
  "prometheus-api-metrics": "^3.2.2", // Métriques monitoring
  "compression": "^1.7.4"      // Compression gzip
}
```

### Migration Versions
- **Express 5.0:** Breaking changes (prévoir migration)
- **Socket.io 5.0:** Nouvelles features WebTransport
- **Mongoose 8.0:** Améliorations performance

---

**Fin de la documentation pour package.json**  
*Document généré automatiquement le 5 mai 2026*
