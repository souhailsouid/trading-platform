# 🧪 Guide Complet : Faire Fonctionner et Tester les APIs

## 📋 Étape 1 : Vérifier les Prérequis

### 1.1 Vérifier Node.js

```bash
node --version  # Doit être 18+
npm --version
```

### 1.2 Vérifier AWS CLI

```bash
aws --version
aws sts get-caller-identity  # Vérifier vos credentials AWS
```

### 1.3 Vérifier AWS CDK

```bash
cdk --version
```

Si pas installé :
```bash
npm install -g aws-cdk
```

---

## 📦 Étape 2 : Installation

### 2.1 Installer les dépendances

```bash
npm install
```

### 2.2 Configurer l'environnement (optionnel)

```bash
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export CDK_DEFAULT_REGION=eu-west-3
```

Ou créer un fichier `.env` :
```bash
CDK_DEFAULT_ACCOUNT=your-account-id
CDK_DEFAULT_REGION=eu-west-3
```

---

## 🚀 Étape 3 : Déploiement

### 3.1 Bootstrap CDK (première fois uniquement)

```bash
npm run bootstrap
```

**Note :** Cette commande crée les ressources CDK nécessaires dans votre compte AWS. À faire une seule fois par région.

### 3.2 Déployer le stack

```bash
npm run deploy
```

Ou directement :

```bash
./scripts/deploy.sh
```

**Durée :** 5-10 minutes pour la première fois

**Ce qui est créé :**
- ✅ API Gateway avec endpoints
- ✅ Lambda Functions (3 fonctions)
- ✅ DynamoDB Tables (3 tables)
- ✅ SNS Topic
- ✅ IAM Roles et Permissions

---

## ✅ Étape 4 : Vérifier le Déploiement

### 4.1 Récupérer les URLs de l'API

```bash
npm run get-outputs
```

Ou :

```bash
./scripts/get-outputs.sh
```

**Vous obtiendrez :**
- `WebhookApiUrl` : URL pour recevoir les alertes TradingView
- `AlertsApiUrl` : URL pour récupérer les alertes
- `ApiKeyValue` : Clé API (si nécessaire)

**Exemple de sortie :**
```
WebhookApiUrl:
   https://abc123.execute-api.eu-west-3.amazonaws.com/prod/webhooks

AlertsApiUrl:
   https://abc123.execute-api.eu-west-3.amazonaws.com/prod/alerts
```

### 4.2 Vérifier que le stack est déployé

```bash
aws cloudformation describe-stacks --stack-name TradingStack
```

---

## 🧪 Étape 5 : Tester les APIs

### 5.1 Test Automatique de l'API de Récupération

```bash
npm run test:api
```

Ou :

```bash
./scripts/test-api.sh
```

**Ce script teste :**
- ✅ Récupérer toutes les alertes
- ✅ Récupérer les alertes d'un symbole (TAOUSDT)
- ✅ Récupérer avec limite (5 alertes)

### 5.2 Test Automatique du Webhook

```bash
npm run test:webhook
```

Ou :

```bash
./scripts/test-webhook.sh
```

**Ce script :**
- ✅ Simule une alerte TradingView (RSI)
- ✅ Envoie le payload au webhook
- ✅ Vérifie la réponse

---

## 🔍 Étape 6 : Tests Manuels avec curl

### 6.1 Récupérer l'URL de l'API

```bash
ALERTS_URL=$(aws cloudformation describe-stacks \
  --stack-name TradingStack \
  --query 'Stacks[0].Outputs[?OutputKey==`AlertsApiUrl`].OutputValue' \
  --output text)

echo "API URL: $ALERTS_URL"
```

### 6.2 Test 1 : Récupérer toutes les alertes

```bash
curl "$ALERTS_URL"
```

**Réponse attendue :**
```json
{
  "success": true,
  "count": 0,
  "alerts": []
}
```

### 6.3 Test 2 : Récupérer les alertes d'un symbole

```bash
curl "$ALERTS_URL?symbol=TAOUSDT"
```

### 6.4 Test 3 : Récupérer avec limite

```bash
curl "$ALERTS_URL?limit=10"
```

### 6.5 Test 4 : Tester le webhook

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

**Réponse attendue :**
```json
{
  "message": "Webhook processed successfully",
  "data": {
    "processed": true,
    "timestamp": "2025-11-05T15:00:00.000Z",
    "alertId": "uuid-here",
    "signal": {
      "symbol": "TAOUSDT",
      "price": 395.4,
      "time": "2025-11-05T14:00:00Z"
    }
  }
}
```

---

## 📊 Étape 7 : Vérifier DynamoDB

### 7.1 Lister les tables créées

```bash
aws dynamodb list-tables | grep Trading
```

### 7.2 Voir les alertes dans la table

```bash
# Récupérer le nom de la table
TABLE_NAME=$(aws cloudformation describe-stack-resources \
  --stack-name TradingStack \
  --query 'StackResources[?LogicalResourceId==`TradingAlertsTable`].PhysicalResourceId' \
  --output text)

# Voir les alertes
aws dynamodb scan \
  --table-name "$TABLE_NAME" \
  --limit 5
```

---

## 📝 Étape 8 : Vérifier les Logs CloudWatch

### 8.1 Lister les fonctions Lambda

```bash
aws lambda list-functions | grep Trading
```

### 8.2 Voir les logs du webhook handler

```bash
# Récupérer le nom de la fonction
FUNC_NAME=$(aws cloudformation describe-stack-resources \
  --stack-name TradingStack \
  --query 'StackResources[?LogicalResourceId==`TradingViewWebhookHandler`].PhysicalResourceId' \
  --output text)

# Voir les logs
aws logs tail "/aws/lambda/$FUNC_NAME" --follow
```

---

## 🔗 Étape 9 : Configuration TradingView

### 9.1 Récupérer l'URL du webhook

```bash
npm run get-outputs
```

### 9.2 Copier les Pine Scripts

Les Pine Scripts sont dans `pine-scripts/` :
- `tradingview-rsi-alert.pine` : Alerte RSI
- `tradingview-macd-alert.pine` : Alerte MACD

### 9.3 Créer l'alerte dans TradingView

1. Copier le Pine Script dans TradingView
2. Créer une alerte avec l'URL webhook
3. Voir `docs/TRADINGVIEW-SETUP-GUIDE.md` pour plus de détails

---

## 📱 Étape 10 : Configuration Telegram (optionnel)

### 10.1 Obtenir votre Chat ID

```bash
./scripts/get-telegram-chat-id.sh <BOT_TOKEN>
```

### 10.2 Ajouter le bot Telegram

```bash
./scripts/add-telegram-bot.sh TAOUSDT <CHAT_ID> <BOT_TOKEN>
```

Voir `docs/CONFIGURER-TELEGRAM.md` pour plus de détails.

---

## 🆘 Troubleshooting

### Erreur : Stack non trouvé

```bash
# Vérifier que le stack est déployé
aws cloudformation describe-stacks --stack-name TradingStack

# Si non trouvé, déployer
npm run deploy
```

### Erreur : Permissions insuffisantes

Vérifiez que votre utilisateur AWS a les permissions pour :
- Créer des Lambda functions
- Créer des tables DynamoDB
- Créer des API Gateway
- Créer des SNS topics
- Créer des IAM roles

### Erreur : CDK bootstrap nécessaire

```bash
npm run bootstrap
```

### Erreur : API retourne 403

Vérifiez que vous utilisez la bonne URL et que l'API Gateway est déployé.

### Erreur : Webhook retourne 400

Vérifiez le format du payload JSON. Il doit correspondre au format attendu.

---

## ✅ Checklist de Vérification

- [ ] Node.js 18+ installé
- [ ] AWS CLI configuré
- [ ] AWS CDK installé
- [ ] `npm install` exécuté
- [ ] `npm run bootstrap` exécuté (première fois)
- [ ] `npm run deploy` exécuté avec succès
- [ ] `npm run get-outputs` retourne les URLs
- [ ] `npm run test:api` fonctionne
- [ ] `npm run test:webhook` fonctionne
- [ ] DynamoDB contient des alertes (après test webhook)
- [ ] Logs CloudWatch montrent les requêtes

---

## 📚 Documentation Complète

- `README.md` : Vue d'ensemble du projet
- `QUICK-START.md` : Guide de démarrage rapide
- `docs/TRADINGVIEW-SETUP-GUIDE.md` : Configuration TradingView
- `docs/CONFIGURER-TELEGRAM.md` : Configuration Telegram
- `docs/TRADINGVIEW-ALERTES-SEPAREES.md` : Alertes RSI et MACD

---

## 🎯 Prochaines Étapes

1. ✅ Tester les APIs (fait)
2. ✅ Configurer TradingView
3. ✅ Configurer Telegram (optionnel)
4. ✅ Intégrer avec le frontend (flowdesk)

