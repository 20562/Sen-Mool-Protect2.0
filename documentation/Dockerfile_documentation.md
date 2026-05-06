# Documentation du Code: Dockerfile
## SEN-MOOL PROTECT 2.0 - Conteneurisation Backend Node.js

**Fichier:** `/backend/Dockerfile`  
**Auteur:** GitHub Copilot  
**Date:** 5 mai 2026  
**Version:** 1.0.0  
**Type:** Configuration Docker  

---

## 1. Vue d'ensemble

Le `Dockerfile` définit l'image Docker pour le conteneur du backend SEN-MOOL PROTECT 2.0. Il utilise une approche multi-stage build optimisée pour la production avec Node.js 18 sur Alpine Linux.

---

## 2. Configuration Image

### Image de Base
```dockerfile
FROM node:18-alpine
```

**Node.js 18 Alpine:**
- **Taille réduite:** ~40MB vs ~180MB Debian
- **Sécurité:** Mise à jour régulière
- **Performance:** Optimisé pour conteneurs
- **Compatibilité:** Node.js LTS

### Répertoire de Travail
```dockerfile
WORKDIR /app
```

**Répertoire standard:** `/app` pour applications Node.js

---

## 3. Installation Dépendances

### Copie Fichiers Package
```dockerfile
COPY package*.json ./
```

**Optimisation cache:** Copie d'abord les fichiers package.json pour tirer parti du cache Docker lors des changements de code uniquement.

### Installation Dépendances
```dockerfile
RUN npm ci --only=production
```

**npm ci:**
- **Déterministe:** Installation exacte des versions
- **Rapide:** Pas de résolution de versions
- **Production:** Exclusion devDependencies
- **Sécurisé:** Vérification package-lock.json

---

## 4. Copie Code Application
```dockerfile
COPY . .
```

**Copie complète:** Après installation dépendances pour optimiser le cache des layers.

---

## 5. Exposition Port
```dockerfile
EXPOSE 3000
```

**Port application:** 3000 (configuré dans server.js)

---

## 6. Health Check

### Configuration Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
```

### Paramètres
- **--interval=30s:** Vérification toutes les 30 secondes
- **--timeout=10s:** Timeout réponse 10 secondes
- **--start-period=5s:** Délai avant première vérification
- **--retries=3:** 3 tentatives avant échec

### Endpoint Testé
- **/health:** Endpoint défini dans server.js
- **Status 200:** Service healthy
- **Autre status:** Service unhealthy

---

## 7. Commande Démarrage
```dockerfile
CMD ["npm", "start"]
```

**npm start:** Exécute `node server.js` (défini dans package.json)

---

## 8. Construction Image

### Build Commande
```bash
# Depuis répertoire backend/
docker build -t senmool-backend .

# Avec build args si nécessaire
docker build --build-arg NODE_ENV=production -t senmool-backend .
```

### Vérification Image
```bash
# Informations image
docker images senmool-backend

# Inspection layers
docker history senmool-backend

# Analyse taille
docker inspect senmool-backend | grep -A 10 "Size"
```

---

## 9. Optimisations

### Multi-Stage Build (Recommandé)
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
CMD ["npm", "start"]
```

**Avantages:**
- **Taille réduite:** Pas d'outils build en production
- **Sécurité:** Surface d'attaque minimisée
- **Performance:** Layers optimisés

### Variables d'Environnement
```dockerfile
# Ajout possible
ENV NODE_ENV=production
ENV PORT=3000
```

---

## 10. Sécurité

### Utilisateur Non-Root
```dockerfile
# Recommandé pour production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
```

### Mise à Jour Sécurité
```dockerfile
# Mise à jour paquets Alpine
RUN apk update && apk upgrade
```

### Secrets
```dockerfile
# Ne pas inclure secrets dans image
# Utiliser variables environnement à runtime
ENV JWT_SECRET=""
ENV MONGODB_URI=""
```

---

## 11. Débogage et Maintenance

### Exécution Interactive
```bash
# Debug container
docker run -it --rm senmool-backend /bin/sh

# Vérifier installation
docker run --rm senmool-backend npm list

# Logs application
docker logs <container_id>
```

### Health Check Manuel
```bash
# Test endpoint health
docker run --rm -p 3000:3000 senmool-backend &
sleep 5
curl http://localhost:3000/health
```

### Monitoring Ressources
```bash
# Utilisation CPU/Mémoire
docker stats <container_id>

# Logs health check
docker inspect <container_id> | grep -A 10 "Health"
```

---

## 12. Intégration Docker Compose

### Configuration Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/senmool
      - MQTT_BROKER=mosquitto
    depends_on:
      - mongodb
      - mosquitto
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Volumes et Persistance
```yaml
volumes:
  - ./logs:/app/logs  # Si logging fichier
  - /tmp              # Cache npm temporaire
```

---

## 13. Performance

### Métriques Image
- **Taille:** ~150MB (avec dépendances)
- **Layers:** 8-10 layers optimisés
- **Démarrage:** < 5 secondes
- **Mémoire:** ~100MB RAM utilisation

### Optimisations Additionnelles
```dockerfile
# .dockerignore
node_modules
npm-debug.log
.git
.env
*.md

# Compression layers
RUN npm cache clean --force
```

---

## 14. CI/CD Intégration

### Build Automatisé
```yaml
# GitHub Actions
- name: Build Backend Image
  run: |
    docker build -t senmool-backend:${{ github.sha }} ./backend
    docker tag senmool-backend:${{ github.sha }} senmool-backend:latest
```

### Registry Push
```bash
# Tag et push
docker tag senmool-backend registry.senmool.sn/backend:latest
docker push registry.senmool.sn/backend:latest
```

### Security Scanning
```bash
# Scan vulnérabilités
docker scan senmool-backend

# Alternatives: Trivy, Clair
trivy image senmool-backend
```

---

## 15. Dépannage

### Problèmes Courants

#### Build échoue
```bash
# Vérifier contexte build
docker build --no-cache -t senmool-backend .

# Debug build
docker build --progress=plain -t senmool-backend .
```

#### Health check échoue
```bash
# Test manuel
docker run -d --name test-backend senmool-backend
docker exec test-backend curl http://localhost:3000/health

# Logs application
docker logs test-backend
```

#### Port déjà utilisé
```bash
# Vérifier ports utilisés
docker ps
netstat -tulpn | grep :3000

# Changer port mapping
docker run -p 3001:3000 senmool-backend
```

#### Mémoire insuffisante
```bash
# Augmenter limite mémoire Docker
docker run --memory=512m --memory-swap=1g senmool-backend
```

---

## 16. Extensions Futures

### Fonctionnalités Avancées
```dockerfile
# Support HTTPS
EXPOSE 443
COPY ssl/ /app/ssl/

# Monitoring intégré
COPY prometheus.yml /app/
EXPOSE 9090

# Debugging
ENV DEBUG=*
EXPOSE 9229  # Node.js inspector
```

### Orchestration Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: senmool-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: senmool-backend:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
```

---

**Fin de la documentation pour Dockerfile**  
*Document généré automatiquement le 5 mai 2026*
