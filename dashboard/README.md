# SenMoolProtect 2.0 - Dashboard Web

Dashboard temps réel pour superviser les pêcheurs en mer.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- Serveur backend Node.js en cours d'exécution sur `http://localhost:3000`

### Installation

```bash
cd dashboard
npm install
```

### Développement

```bash
npm run dev
```

Le dashboard sera accessible à `http://localhost:5173`

### Production

```bash
npm run build
npm run preview
```

## 📊 Fonctionnalités

- **Tableau de bord** : Vue d'ensemble en temps réel
- **Carte interactive** : Localisation des pêcheurs
- **Gestion des pêcheurs** : Liste et détails individuels
- **Système d'alertes** : Gestion des alertes SOS, chutes, anomalies
- **Statistiques** : Analyse et rapports
- **Paramètres** : Configuration système

## 🏗️ Architecture

```
src/
├── components/       # Composants réutilisables
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── StatCard.tsx
│   ├── Map.tsx
│   └── RecentAlerts.tsx
├── pages/           # Pages principales
│   ├── Dashboard.tsx
│   ├── Alerts.tsx
│   ├── Fishermen.tsx
│   ├── Analytics.tsx
│   └── Settings.tsx
├── store/          # État global (Zustand)
│   └── index.ts
├── types/          # Types TypeScript
│   └── index.ts
├── App.tsx         # Composant racine
└── main.tsx        # Point d'entrée
```

## 🔌 WebSocket Events

Le dashboard écoute les événements temps réel du serveur :

- `fisherman:update` - Mise à jour d'un pêcheur
- `fisherman:new` - Nouveau pêcheur en ligne
- `alert:new` - Nouvelle alerte
- `stats:update` - Mise à jour des statistiques

## 🛠️ Technologies

- **React 18** - UI framework
- **React Router v6** - Navigation
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Socket.io** - WebSocket communication
- **Lucide Icons** - Icons
- **date-fns** - Date formatting

## 📱 Responsive

Le dashboard est entièrement responsive et fonctionne sur desktop, tablette et mobile.

## 🔐 Sécurité

- Variables d'environnement pour les URLs sensibles
- Tokens JWT pour l'authentification (à implémenter)
- HTTPS en production

## 📝 Licence

© 2026 SenMoolProtect - Souveraineté Numérique
