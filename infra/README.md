# 📊 Trading Backend CDK

Infrastructure AWS CDK pour recevoir et traiter les alertes TradingView via webhooks.

## 🏗️ Architecture

```
TradingView Alerts
    ↓
API Gateway
    ↓
Lambda Functions
    ↓
DynamoDB + SNS + Telegram/Slack
```

## 📋 Composants

- **API Gateway** : Endpoint webhook pour recevoir les alertes TradingView
- **Lambda Functions** :
  - `TradingViewWebhookHandler` : Traite les alertes TradingView
  - `GetTradingAlertsHandler` : API pour récupérer les alertes
  - `SlackRelayLambda` : Relay pour notifications Slack
- **DynamoDB** :
  - `TradingAlertsTable` : Stocke les alertes
  - `SlackWebhooksTable` : Configuration webhooks Slack
  - `TelegramBotsTable` : Configuration bots Telegram
- **SNS** : Notifications
- **Telegram/Slack** : Notifications en temps réel

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- AWS CLI configuré
- AWS CDK CLI installé : `npm install -g aws-cdk`

### Installation

```bash
npm install
```

### Déploiement

```bash
npm run deploy
```

Ou directement :

```bash
./scripts/deploy.sh
```

### Récupérer l'URL du webhook

```bash
npm run get-outputs
```

Ou :

```bash
./scripts/get-outputs.sh
```

## 📝 Configuration

### TradingView

1. Copier les Pine Scripts depuis `pine-scripts/` dans TradingView
2. Créer une alerte avec l'URL webhook récupérée
3. Voir `docs/TRADINGVIEW-SETUP-GUIDE.md` pour plus de détails

### Telegram

1. Créer un bot Telegram via [@BotFather](https://t.me/BotFather)
2. Obtenir votre Chat ID
3. Ajouter le bot :

```bash
./scripts/add-telegram-bot.sh <SYMBOL> <CHAT_ID> <BOT_TOKEN>
```

Voir `docs/CONFIGURER-TELEGRAM.md` pour plus de détails.

## 📚 Documentation

- `docs/TRADINGVIEW-SETUP-GUIDE.md` : Configuration TradingView
- `docs/CONFIGURER-TELEGRAM.md` : Configuration Telegram
- `docs/TRADINGVIEW-ALERTES-SEPAREES.md` : Alertes RSI et MACD

## 🏗️ Structure du Projet

```
.
├── bin/
│   └── trading-app.ts          # Point d'entrée CDK
├── lib/
│   ├── stacks/
│   │   └── trading-stack.ts    # Stack CDK principal
│   ├── functions/
│   │   ├── tradingview-webhook/    # Handler webhook
│   │   ├── get-trading-alerts/     # API récupération alertes
│   │   └── slack-relay-lambda/     # Relay Slack
│   └── shared/
│       ├── types/
│       │   └── trading.ts      # Types TypeScript
│       └── utils/
│           └── trading.ts      # Utilitaires
├── scripts/
│   ├── deploy.sh               # Script de déploiement
│   ├── get-outputs.sh          # Récupérer les outputs
│   └── add-telegram-bot.sh     # Ajouter bot Telegram
├── pine-scripts/
│   ├── tradingview-rsi-alert.pine
│   └── tradingview-macd-alert.pine
├── docs/
│   └── ...                     # Documentation
└── cdk.json                    # Configuration CDK
```

## 🔧 Commandes CDK

```bash
# Synthétiser le template CloudFormation
npm run synth

# Voir les différences
npm run diff

# Déployer
npm run deploy

# Bootstrap CDK (première fois)
npm run bootstrap
```

## 📊 API Endpoints

Après déploiement, vous obtenez :

- **Webhook URL** : `https://<api-id>.execute-api.<region>.amazonaws.com/prod/webhooks`
- **Alerts API** : `https://<api-id>.execute-api.<region>.amazonaws.com/prod/alerts`

## 🔐 Sécurité

- API Gateway avec clé API
- Lambda avec IAM roles minimaux
- DynamoDB avec point-in-time recovery
- Secrets dans AWS Secrets Manager

## 📝 License

ISC

## 👤 Auteur

Souhail SOUID
