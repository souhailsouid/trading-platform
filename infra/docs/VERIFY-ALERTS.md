# ✅ Comment Vérifier que les Alertes TradingView ont été Reçues

## 🎯 Méthodes de Vérification

### 1️⃣ Via l'API (Le Plus Rapide) ⭐

```bash
# Voir toutes les alertes
curl https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/alerts | jq

# Voir les 5 dernières alertes
curl "https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/alerts?limit=5" | jq

# Filtrer par symbole (ex: TAOUSDT)
curl "https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/alerts?symbol=TAOUSDT" | jq

# Voir les alertes avec RSI < 30
curl "https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/alerts?rsi_threshold=30&rsi_operator=lt" | jq
```

**Ou utilise le script** :
```bash
./scripts/check-trading-alerts.sh
```

---

### 2️⃣ Via AWS Console - DynamoDB

1. Va dans **AWS Console** → **DynamoDB**
2. Clique sur **"Tables"** dans le menu de gauche
3. Cherche la table : `TradingStack-TradingAlertsTable-XXXXX`
4. Clique sur la table
5. Clique sur **"Explorer les éléments de table"**
6. Tu verras toutes les alertes sauvegardées !

**Filtres disponibles** :
- Trier par `timestamp` (plus récent en premier)
- Filtrer par `symbol` (ex: TAOUSDT)

---

### 3️⃣ Via AWS Console - CloudWatch Logs

1. Va dans **AWS Console** → **CloudWatch**
2. Clique sur **"Log groups"** dans le menu de gauche
3. Cherche : `/aws/lambda/TradingStack-TradingViewWebhookHandler-XXXXX`
4. Clique sur le log group
5. Clique sur **"Log streams"** (le plus récent en haut)
6. Tu verras les logs détaillés de chaque alerte reçue !

**Ce que tu devrais voir dans les logs** :
```
=== TRADINGVIEW WEBHOOK EVENT DEBUG ===
Method: POST
Body: {"symbol":"TAOUSDT","price":300.5,...}
✅ Parsed webhook data: {...}
Processing trade signal: {...}
```

---

### 4️⃣ Via AWS CLI

```bash
# Voir les logs CloudWatch (dernières 10 minutes)
aws logs tail "/aws/lambda/TradingStack-TradingViewWebhookHandlerD24CC03A-OljKgwnk9Zrr" --since 10m --follow

# Compter les éléments DynamoDB
aws dynamodb scan \
  --table-name "TradingStack-TradingAlertsTable-XXXXX" \
  --select COUNT

# Voir les 3 derniers éléments
aws dynamodb scan \
  --table-name "TradingStack-TradingAlertsTable-XXXXX" \
  --limit 3 \
  --query 'Items[*].{Symbol: symbol.S, Price: price.N, RSI: rsi.N, Time: time.S}' \
  --output table
```

---

## 🐛 Dépannage

### Problème : Aucune alerte dans l'API

**Vérifications** :
1. ✅ L'alerte TradingView a bien été déclenchée ?
2. ✅ L'URL webhook est correcte ?
3. ✅ Le message JSON est valide ?
4. ✅ Vérifie les logs CloudWatch pour voir les erreurs

### Problème : Erreur dans les logs CloudWatch

**Logs à vérifier** :
- `❌ No body provided` → Le message webhook n'est pas correct
- `❌ Invalid JSON format` → Le JSON n'est pas valide
- `❌ Error processing webhook` → Erreur dans le traitement

**Solutions** :
1. Vérifie le message webhook dans TradingView
2. Teste le JSON sur https://jsonlint.com/
3. Vérifie que les guillemets sont des `"` (pas `'`)

### Problème : Lambda déclenchée mais pas de données

**Vérifications** :
1. ✅ Regarde les logs CloudWatch pour voir ce qui est reçu
2. ✅ Vérifie que le body est présent dans les logs
3. ✅ Vérifie que le JSON est parsable

---

## 📊 Exemple de Vérification Complète

### 1. Vérifier l'API
```bash
curl "https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/alerts?limit=1" | jq '.alerts[0]'
```

**Résultat attendu** :
```json
{
  "symbol": "TAOUSDT",
  "price": 300.5,
  "timestamp": "2025-11-05T14:32:12.566Z",
  "time": "2025-01-15T10:30:00Z",
  "indicators": {
    "rsi": 25.5,
    "macd": {
      "macd": 1.2,
      "signal": 0.8,
      "histogram": 0.4
    },
    "stoch": {
      "k": 20.5,
      "d": 18.3
    }
  }
}
```

### 2. Vérifier DynamoDB
- Va dans AWS Console → DynamoDB
- Trouve la table `TradingStack-TradingAlertsTable-XXXXX`
- Clique sur "Explorer les éléments de table"
- Tu devrais voir ton alerte avec tous les indicateurs !

### 3. Vérifier les Logs CloudWatch
- Va dans AWS Console → CloudWatch → Log groups
- Trouve le log group de la Lambda
- Regarde les logs récents pour voir l'alerte reçue

---

## ✅ Checklist de Vérification

Après avoir déclenché une alerte TradingView :

- [ ] API accessible : `curl https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/alerts`
- [ ] Alerte visible dans l'API (dernière alerte avec le bon symbole)
- [ ] Alerte sauvegardée dans DynamoDB
- [ ] Logs CloudWatch montrent l'alerte reçue
- [ ] Notification Slack envoyée (si configurée)

---

## 🚀 Script Rapide

Utilise le script de vérification :
```bash
./scripts/check-trading-alerts.sh
```

Ce script vérifie automatiquement :
- ✅ API accessible
- ✅ Nombre d'alertes reçues
- ✅ Dernières alertes
- ✅ DynamoDB (nombre d'éléments)
- ✅ Logs CloudWatch récents

---

## 📞 Support

Si tu ne vois pas les alertes :
1. Vérifie les logs CloudWatch (erreurs éventuelles)
2. Vérifie que l'alerte TradingView est bien configurée
3. Teste l'endpoint avec curl pour vérifier qu'il fonctionne
4. Partage les logs CloudWatch pour diagnostic

