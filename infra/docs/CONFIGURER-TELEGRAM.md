# 📱 Configuration Telegram pour les Alertes Trading

## 🎯 Vue d'ensemble

Vous pouvez maintenant recevoir des notifications Telegram pour vos alertes RSI et MACD. Le système utilise l'API Telegram Bot pour envoyer des messages.

## 📋 Prérequis

1. **Créer un bot Telegram**
   - Ouvrez Telegram et cherchez [@BotFather](https://t.me/BotFather)
   - Envoyez `/newbot` et suivez les instructions
   - Copiez le **token** du bot (ex: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

2. **Obtenir votre Chat ID**
   - Commencez une conversation avec votre bot
   - Envoyez un message à votre bot
   - Visitez : `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Cherchez `"chat":{"id":XXXXX}` dans la réponse
   - Copiez le **Chat ID** (ex: `123456789`)

## 🔧 Configuration dans DynamoDB

### Étape 1 : Accéder à DynamoDB

1. Allez dans **AWS Console** → **DynamoDB**
2. Cherchez la table : `TradingStack-TelegramBotsTable-XXXXX`
3. Cliquez sur **"Items"** puis **"Create item"**

### Étape 2 : Ajouter un bot Telegram

Ajoutez un item avec cette structure :

```json
{
  "symbol": "TAOUSDT",
  "chat_id": "123456789",
  "bot_token": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
}
```

**Champs :**
- `symbol` : Le symbole de trading (ex: `TAOUSDT`, `BTCUSDT`)
- `chat_id` : Votre Chat ID Telegram
- `bot_token` : Le token de votre bot Telegram

### Étape 3 : Répéter pour d'autres symboles

Si vous voulez recevoir des notifications pour plusieurs symboles, ajoutez un item pour chaque symbole.

---

## 📨 Format des messages Telegram

Les messages Telegram sont formatés avec Markdown et incluent :

### Exemple pour une alerte RSI :

```
📉 RSI Alert: TAOUSDT

Symbol: TAOUSDT
Price: 395.4
Time: 2025-11-05T14:00:00Z
Alert Type: RSI

RSI: 28.50
```

### Exemple pour une alerte MACD :

```
📈 MACD Alert: TAOUSDT (Bullish Signal Crossover)

Symbol: TAOUSDT
Price: 395.4
Time: 2025-11-05T14:00:00Z
Alert Type: MACD
Signal Type: Bullish Signal Crossover

MACD: 0.0813
Signal: 0.0337
Histogram: 0.0476
```

---

## ✅ Vérification

### 1. Vérifier que la table existe

```bash
aws dynamodb describe-table --table-name TradingStack-TelegramBotsTable-XXXXX
```

### 2. Vérifier les items dans la table

```bash
aws dynamodb scan --table-name TradingStack-TelegramBotsTable-XXXXX
```

### 3. Tester une alerte

1. Déclenchez une alerte depuis TradingView
2. Vérifiez que vous recevez le message Telegram
3. Vérifiez les logs CloudWatch pour voir si Telegram a été appelé

---

## 🔍 Troubleshooting

### Le bot ne répond pas

1. **Vérifiez le token** : Assurez-vous que le token est correct
2. **Vérifiez le Chat ID** : Assurez-vous que le Chat ID est correct
3. **Vérifiez que vous avez commencé une conversation** : Le bot doit avoir reçu au moins un message de votre part

### Pas de notification Telegram

1. **Vérifiez les logs CloudWatch** :
   - Cherchez : `/aws/lambda/TradingStack-TradingViewWebhookHandler-XXXXX`
   - Cherchez les messages : `Notification sent to Telegram for ...` ou `No Telegram bot found for ...`

2. **Vérifiez DynamoDB** :
   - Assurez-vous que l'item existe dans la table
   - Vérifiez que le `symbol` correspond exactement (ex: `TAOUSDT`)

3. **Vérifiez les permissions** :
   - Le Lambda doit avoir les permissions de lecture sur la table TelegramBotsTable

---

## 📝 Exemple de script pour ajouter un bot

```bash
# Remplacer avec vos valeurs
SYMBOL="TAOUSDT"
CHAT_ID="123456789"
BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
TABLE_NAME="TradingStack-TelegramBotsTable-XXXXX"

aws dynamodb put-item \
  --table-name $TABLE_NAME \
  --item "{
    \"symbol\": {\"S\": \"$SYMBOL\"},
    \"chat_id\": {\"S\": \"$CHAT_ID\"},
    \"bot_token\": {\"S\": \"$BOT_TOKEN\"}
  }"
```

---

## 🚀 Déploiement

Après avoir ajouté le support Telegram, redéployez le stack :

```bash
./scripts/deploy-trading-only.sh
```

---

## 📚 Ressources

- [Documentation API Telegram Bot](https://core.telegram.org/bots/api)
- [Créer un bot avec BotFather](https://core.telegram.org/bots/tutorial)
- [Obtenir votre Chat ID](https://core.telegram.org/bots/api#getting-updates)

