# 🚀 Guide de Démarrage Rapide

## 📋 Prérequis

- Node.js 18+
- AWS CLI configuré avec vos credentials
- AWS CDK CLI installé : `npm install -g aws-cdk`
- Compte AWS avec permissions appropriées

## 🔧 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer l'environnement (optionnel)

```bash
cp .env.example .env
# Éditer .env avec vos valeurs AWS
```

Ou définir les variables d'environnement :

```bash
export CDK_DEFAULT_ACCOUNT=your-aws-account-id
export CDK_DEFAULT_REGION=eu-west-3
```

## 🚀 Déploiement

### Première fois : Bootstrap CDK

```bash
npm run bootstrap
```

### Déployer le stack

```bash
npm run deploy
```

Ou directement :

```bash
./scripts/deploy.sh
```

## ✅ Vérification

### Récupérer les URLs de l'API

```bash
npm run get-outputs
```

Ou :

```bash
./scripts/get-outputs.sh
```

Vous obtiendrez :
- **WebhookApiUrl** : URL pour les alertes TradingView
- **AlertsApiUrl** : URL pour récupérer les alertes
- **ApiKeyValue** : Clé API (si nécessaire)

## 🧪 Tester les APIs

### Test 1: Tester l'API de récupération des alertes

```bash
./scripts/test-api.sh
```

### Test 2: Tester le webhook (simuler une alerte)

```bash
./scripts/test-webhook.sh
```

### Test manuel avec curl

#### Récupérer toutes les alertes

```bash
ALERTS_URL=$(aws cloudformation describe-stacks \
  --stack-name TradingStack \
  --query 'Stacks[0].Outputs[?OutputKey==`AlertsApiUrl`].OutputValue' \
  --output text)

curl "$ALERTS_URL"
```

#### Récupérer les alertes d'un symbole

```bash
curl "$ALERTS_URL?symbol=TAOUSDT"
```

#### Récupérer avec limite

```bash
curl "$ALERTS_URL?limit=10"
```

#### Tester le webhook

```bash
WEBHOOK_URL=$(aws cloudformation describe-stacks \
  --stack-name TradingStack \
  --query 'Stacks[0].Outputs[?OutputKey==`WebhookApiUrl`].OutputValue' \
  --output text)

curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "alertType": "RSI",
    "symbol": "TAOUSDT",
    "price": 395.4,
    "time": "2025-11-05T14:00:00Z",
    "indicators": {
      "rsi": 28.5
    }
  }' \
  "$WEBHOOK_URL"
```

## 📊 Vérifier DynamoDB

```bash
# Lister les tables
aws dynamodb list-tables | grep Trading

# Voir les alertes
aws dynamodb scan \
  --table-name TradingStack-TradingAlertsTable-XXXXX \
  --limit 5
```

## 📝 Vérifier les logs CloudWatch

```bash
# Lister les fonctions Lambda
aws lambda list-functions | grep Trading

# Voir les logs
aws logs tail /aws/lambda/TradingStack-TradingViewWebhookHandler-XXXXX --follow
```

## 🔗 Configuration TradingView

1. Récupérer l'URL du webhook : `npm run get-outputs`
2. Copier les Pine Scripts depuis `pine-scripts/` dans TradingView
3. Créer une alerte avec l'URL webhook
4. Voir `docs/TRADINGVIEW-SETUP-GUIDE.md` pour plus de détails

## 📱 Configuration Telegram

```bash
./scripts/add-telegram-bot.sh <SYMBOL> <CHAT_ID> <BOT_TOKEN>
```

Voir `docs/CONFIGURER-TELEGRAM.md` pour plus de détails.

## 🆘 Troubleshooting

### Erreur: Stack non trouvé

```bash
# Vérifier que le stack est déployé
aws cloudformation describe-stacks --stack-name TradingStack
```

### Erreur: Permissions insuffisantes

Vérifiez que votre utilisateur AWS a les permissions nécessaires pour :
- Créer des Lambda functions
- Créer des tables DynamoDB
- Créer des API Gateway
- Créer des SNS topics

### Erreur: CDK bootstrap nécessaire

```bash
npm run bootstrap
```

## 📚 Documentation Complète

- `README.md` : Vue d'ensemble
- `docs/TRADINGVIEW-SETUP-GUIDE.md` : Configuration TradingView
- `docs/CONFIGURER-TELEGRAM.md` : Configuration Telegram
- `docs/TRADINGVIEW-ALERTES-SEPAREES.md` : Alertes RSI et MACD

