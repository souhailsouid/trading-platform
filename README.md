# Trading Platform

## 🎯 Overview
Plateforme de trading en temps réel construite avec React, TypeScript et Vite. Elle permet de visualiser les données de marché Binance, d'analyser les indicateurs techniques (MACD, RSI, Stochastic, Bollinger Bands) et de détecter automatiquement les signaux de trading.

## ✨ Features

### 📊 Visualisation des Données
- **Graphiques en temps réel** : Candlesticks, Volume, MACD, Stochastic
- **Indicateurs techniques** : MACD, RSI, Stochastic Oscillator, Bollinger Bands
- **WebSocket Binance** : Données de marché en temps réel

### 🚨 Détection de Signaux Automatique
- **Détection en temps réel** : Analyse automatique des klines via WebSocket
- **Multi-indicateurs** : MACD, RSI, Stochastic, Bollinger Bands
- **Confirmations multiples** : Signaux renforcés quand plusieurs indicateurs concordent
- **Notifications** : Alertes navigateur pour les nouveaux signaux

### 📈 Indicateurs Techniques Implémentés
- **MACD** (Moving Average Convergence Divergence) : Croisements haussiers/baissiers
- **RSI** (Relative Strength Index) : Surachat/Survente, Cassures
- **Stochastic Oscillator** : %K et %D avec zones de surachat/survente
- **Bollinger Bands** : Touchées des bandes supérieures/inférieures

### 🔔 Système d'Alertes
- Alertes en temps réel via WebSocket
- Notifications navigateur
- Historique des signaux détectés

## 🛠️ Technology Stack

### Frontend
- **React 18.2.0** - Framework UI
- **TypeScript 5.2.2** - Typage statique
- **Vite 5.0.8** - Build tool
- **Material-UI (MUI)** - Composants UI
- **Chart.js** - Graphiques (MACD, Stochastic)
- **ApexCharts** - Graphiques candlesticks
- **React Query** - Gestion des données
- **Axios** - Requêtes HTTP

### Backend (Optionnel)
- **AWS CDK** - Infrastructure as Code
- **Lambda Functions** - Traitement des webhooks
- **API Gateway** - Endpoints REST
- **DynamoDB** - Stockage des alertes

## 📦 Installation

### Prérequis
- Node.js 20+
- pnpm (ou npm/yarn)
- NVM (recommandé pour la gestion des versions)

### Setup

```bash
# Cloner le repository
git clone <repository-url>
cd trading-platform

# Installer les dépendances
pnpm install

# Démarrer le serveur de développement
pnpm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🧪 Tests

### Tests Unitaires (Jest)
```bash
# Exécuter les tests
pnpm run test

# Mode watch
pnpm run test:watch
```

### Tests E2E (Cypress)
```bash
# Ouvrir l'interface Cypress
pnpm run cypress:open

# Exécuter les tests en mode headless
pnpm run cypress:run
```

**Note** : Assurez-vous que le serveur de développement est en cours d'exécution (`pnpm run dev`) avant d'exécuter les tests Cypress.

## 🏗️ Build

```bash
# Build pour la production
pnpm run build

# Prévisualiser le build
pnpm run preview
```

## 📚 Architecture

### Structure du Projet
```
src/
├── components/          # Composants React
│   ├── ui/              # Composants UI réutilisables
│   │   ├── chart/       # Graphiques (MACD, Stochastic, Candlestick)
│   │   └── ...
│   ├── TradingSignals.tsx    # Affichage des signaux
│   └── Dashboard.tsx         # Dashboard principal
├── hooks/               # Custom hooks
│   ├── useBinanceKlinesWebSocket.ts  # WebSocket klines
│   ├── useRealtimeSignals.ts         # Détection signaux temps réel
│   └── ...
├── utils/               # Utilitaires
│   ├── TechnicalIndicators.ts  # Calculs indicateurs (MACD, RSI, etc.)
│   └── SignalDetector.ts       # Détection de signaux
├── services/            # Services API
│   └── api/            # Appels API Binance
└── types/              # Types TypeScript
```

### Flux de Données

1. **Initialisation** : Récupération des klines via API REST (1000 points)
2. **Temps réel** : WebSocket Binance pour les nouvelles klines
3. **Calcul** : Calcul des indicateurs techniques à chaque nouvelle kline
4. **Détection** : Analyse automatique des signaux
5. **Affichage** : Mise à jour de l'UI avec les nouveaux signaux

## 🔌 API Binance

L'application utilise l'API publique Binance :
- **REST API** : Récupération initiale des données
- **WebSocket** : Mises à jour en temps réel
  - `@bookTicker` : Prix en temps réel
  - `@kline_{interval}` : Chandeliers en temps réel

Documentation : [Binance API](https://binance-docs.github.io/apidocs/spot/en/)

## 🎨 Fonctionnalités Principales

### 1. Dashboard
- Affichage des informations de marché 24h
- Graphiques candlesticks interactifs
- Analyse de volume

### 2. Indicateurs Techniques
- **MACD** : Ligne MACD, Signal, Histogramme
- **Stochastic** : %K et %D avec zones de référence (20/80)
- **RSI** : Calcul et visualisation (à venir)
- **Bollinger Bands** : Calcul (à venir)

### 3. Détection de Signaux
- **Croisements MACD** : Haussier/Baissier
- **RSI** : Surachat (>70), Survente (<30), Cassures
- **Stochastic** : Zones de surachat/survente
- **Bollinger** : Touchées des bandes
- **Confirmations** : Signaux multiples

### 4. Alertes en Temps Réel
- Surveillance continue via WebSocket
- Notifications automatiques
- Historique des signaux

## 🚀 Déploiement

### Frontend
```bash
# Build
pnpm run build

# Le dossier `dist/` contient les fichiers à déployer
```

### Backend (AWS CDK)
```bash
cd trading-backend-cdk
npm install
npm run deploy
```

## 📝 Scripts Disponibles

- `pnpm run dev` - Serveur de développement
- `pnpm run build` - Build production
- `pnpm run preview` - Prévisualiser le build
- `pnpm run test` - Tests unitaires
- `pnpm run test:watch` - Tests en mode watch
- `pnpm run cypress:open` - Ouvrir Cypress
- `pnpm run cypress:run` - Exécuter tests Cypress
- `pnpm run lint` - Linter ESLint

## 🔒 Sécurité

- Utilisation de l'API publique Binance (pas de clés API requises)
- Pas de données sensibles stockées côté client
- WebSocket sécurisé (WSS)

## 📄 License

Ce projet est un projet de démonstration pour un entretien technique.

## 👤 Auteur

Souhail Souid

## 🙏 Remerciements

- Binance pour l'API publique
- La communauté open-source pour les bibliothèques utilisées
