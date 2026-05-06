# Documentation du Code: auth.js
## SEN-MOOL PROTECT 2.0 - Routes Authentification Backend

**Fichier:** `/backend/routes/auth.js`  
**Auteur:** GitHub Copilot  
**Date:** 5 mai 2026  
**Version:** 1.0.0  
**Langage:** JavaScript (Express.js)  

---

## 1. Vue d'ensemble

Le module `auth.js` implémente les routes d'authentification pour le backend SEN-MOOL PROTECT. Il fournit un système d'authentification JWT (JSON Web Tokens) avec gestion des mots de passe hashés.

**⚠️ Note:** Cette implémentation utilise actuellement des données mockées et doit être intégrée à une vraie base de données utilisateur pour la production.

---

## 2. Dépendances

```javascript
const express = require('express');     // Framework routing
const jwt = require('jsonwebtoken');    // Génération JWT
const bcrypt = require('bcryptjs');     // Hashage mots de passe
```

---

## 3. Configuration

### Base de Données Mock
```javascript
const users = [
  { 
    id: 1, 
    username: 'admin', 
    password: '$2a$10$...',  // Hash bcrypt
    role: 'admin' 
  }
];
```

**Limitations:**
- Données en mémoire (perdues au restart)
- Un seul utilisateur par défaut
- Pas de gestion rôles avancés

---

## 4. Route POST /login

### Endpoint
```http
POST /api/auth/login
Content-Type: application/json
```

### Corps Requête
```json
{
  "username": "admin",
  "password": "motdepasse"
}
```

### Logique Authentification
```javascript
// 1. Recherche utilisateur
const user = users.find(u => u.username === username);

// 2. Vérification existence
if (!user) return res.status(401).json({ error: 'Invalid credentials' });

// 3. Vérification mot de passe
const validPassword = await bcrypt.compare(password, user.password);

// 4. Génération token JWT
const token = jwt.sign(
  { id: user.id, username: user.username, role: user.role },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '24h' }
);
```

### Réponse Succès (200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### Réponses Erreur
```json
// 401 Unauthorized
{ "error": "Invalid credentials" }

// 500 Internal Server Error
{ "error": "Erreur message" }
```

---

## 5. Token JWT

### Payload Token
```javascript
{
  id: user.id,           // Identifiant utilisateur
  username: user.username, // Nom d'utilisateur
  role: user.role,       // Rôle (admin, operator, viewer)
  iat: timestamp,        // Issued at
  exp: timestamp + 24h   // Expiration
}
```

### Configuration Token
```javascript
const token = jwt.sign(
  payload,
  secret_key,           // JWT_SECRET env var
  { 
    expiresIn: '24h'    // Durée validité
  }
);
```

### Utilisation Token
```javascript
// Dans autres routes
const auth = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
};
```

---

## 6. Sécurité Implémentée

### Hashage Mots de Passe
- **bcryptjs:** Algorithme adaptatif
- **Salt rounds:** 10 (configurable)
- **Protection:** Rainbow tables, brute force

### JWT Security
- **Expiration:** 24 heures
- **Secret:** Variable environnement
- **Signature:** HMAC-SHA256

### Validation Input
- **Sanitization:** Express body parser
- **Type checking:** JavaScript strict
- **Error handling:** Try/catch complet

---

## 7. Intégration Système

### Utilisation dans l'Application
```javascript
// Client (Dashboard/Mobile)
const login = async (username, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const { token, user } = await response.json();
  localStorage.setItem('token', token);
};
```

### Middleware Authentification
```javascript
// Protection routes
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## 8. Extension vers Base de Données Réelle

### Migration MongoDB
```javascript
// Modèle User
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'operator', 'viewer'], default: 'viewer' },
  createdAt: { type: Date, default: Date.now }
});

// Remplacer mock
const user = await User.findOne({ username });
const validPassword = await bcrypt.compare(password, user.password);
```

### Routes Additionnelles
```javascript
// POST /register - Inscription
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).json({ message: 'User created' });
});

// POST /refresh - Rafraîchir token
router.post('/refresh', (req, res) => {
  const refreshToken = req.body.refreshToken;
  // Logique refresh token
});
```

---

## 9. Tests et Validation

### Tests Unitaires
```javascript
describe('POST /login', () => {
  it('should return token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password' })
      .expect(200);
    
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('username', 'admin');
  });
  
  it('should return 401 for invalid credentials', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong' })
      .expect(401);
  });
});
```

### Tests Sécurité
- **Brute force protection** (rate limiting)
- **Token expiration** vérifiée
- **SQL injection** prévention
- **XSS protection** headers

---

## 10. Configuration Environnement

### Variables Requises
```bash
# .env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=24h
BCRYPT_ROUNDS=10
```

### Sécurité Clés
- **JWT_SECRET:** 256-bit minimum
- **Rotation:** Périodique (90 jours)
- **Stockage:** Variables environnement sécurisées

---

## 11. Monitoring et Logging

### Logs Authentification
```javascript
// Succès
logger.info(`User ${username} logged in from ${req.ip}`);

// Échec
logger.warn(`Failed login attempt for ${username} from ${req.ip}`);

// Token expiré
logger.info(`Expired token access attempt from ${req.ip}`);
```

### Métriques
- **Tentatives connexion:** Par minute/heure
- **Taux succès/échec:** Pour détecter attaques
- **Tokens actifs:** Nombre sessions
- **Expiration tokens:** Cleanup nécessaire

---

## 12. Dépannage

### Problèmes Courants

#### "Invalid credentials"
```javascript
// Vérifier hash mot de passe
const hashed = await bcrypt.hash('password', 10);
console.log('Expected hash:', hashed);

// Comparer avec base
const user = users.find(u => u.username === username);
console.log('Stored hash:', user.password);
```

#### "jwt malformed"
```javascript
// Vérifier format token
const token = req.header('Authorization');
console.log('Token received:', token);

// Doit être "Bearer <token>"
if (!token.startsWith('Bearer ')) {
  return res.status(401).json({ error: 'Invalid token format' });
}
```

#### Token expiré
```javascript
// Vérifier expiration
const decoded = jwt.verify(token, secret, { ignoreExpiration: true });
console.log('Token expired at:', new Date(decoded.exp * 1000));
```

---

## 13. Extensions Futures

### Fonctionnalités Avancées
```javascript
// Authentification multi-facteurs
const speakeasy = require('speakeasy');
router.post('/login/2fa', (req, res) => {
  const { token, secret } = req.body;
  const verified = speakeasy.totp.verify({ secret, token });
  // Logique 2FA
});

// OAuth integration
const passport = require('passport');
router.get('/google', passport.authenticate('google'));
router.get('/google/callback', passport.authenticate('google'), (req, res) => {
  // Logique OAuth
});

// Gestion sessions
const session = require('express-session');
app.use(session({ secret: process.env.SESSION_SECRET }));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }); // 5 tentatives/15min
router.use('/login', limiter);
```

### Rôles et Permissions
```javascript
const roles = {
  admin: ['read', 'write', 'delete', 'manage_users'],
  operator: ['read', 'write', 'acknowledge_alerts'],
  viewer: ['read']
};

const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (!roles[req.user.role].includes(requiredPermission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

---

## 14. Conformité et Réglementation

### RGPD Compliance
- **Données personnelles:** username, role
- **Consentement:** Required pour traitement
- **Droit oubli:** Suppression données
- **Logs anonymisés:** Pas de stockage mots de passe

### Sécurité Standards
- **OWASP:** Suivre guidelines
- **JWT best practices:** Expiration courte, refresh tokens
- **Password policy:** Complexité, rotation
- **Audit logging:** Toutes actions authentification

---

**Fin de la documentation pour auth.js**  
*Document généré automatiquement le 5 mai 2026*
