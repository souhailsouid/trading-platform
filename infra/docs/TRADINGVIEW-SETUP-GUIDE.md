# 📊 Guide de Configuration TradingView → AWS Webhook

## 🎯 Objectif
Configurer TradingView pour qu'il envoie automatiquement les alertes de trading à ton endpoint AWS Lambda.

---

## 📝 Étape 1 : Créer/Modifier ton Script Pine Script

### Script Pine Script avec RSI, MACD, Stochastique

```pinescript
//@version=6
indicator(title="Webhook Alert – RSI, MACD, Stoch", shorttitle="Webhook", overlay=true)

rsiThreshold = input.float(49.25, "RSI Threshold")  // Seuil RSI pour déclencher l'alerte

// RSI
rsi = ta.rsi(close, 14)
plot(rsi, "RSI", color=color.purple) // plot_0

// Stochastique
stoch_k = ta.sma(ta.stoch(close, high, low, 14), 1)
plot(stoch_k, "Stoch %K", color=color.blue) // plot_1

// MACD
[macd_val, macd_signal, macd_hist] = ta.macd(close, 12, 26, 9)
plot(macd_hist, "MACD Histogram", style=plot.style_histogram, color=color.green) // plot_2
plot(macd_val, "MACD", color=color.blue) // plot_3
plot(macd_signal, "MACD Signal", color=color.red) // plot_4

// Stoch D
stoch_d = ta.sma(stoch_k, 3)
plot(stoch_d, "Stoch %D", color=color.orange) // plot_5

// --- ALERTE SUR RSI ---
alertCondition = rsi < rsiThreshold

alertcondition(
  alertCondition, 
  title="Webhook Trading Alert (RSI)", 
  message='{"symbol":"{{ticker}}","price":{{close}},"time":"{{time}}","indicators":{"rsi":"{{plot_0}}","macd":{"macd":"{{plot_3}}","signal":"{{plot_4}}","histogram":"{{plot_2}}"},"stoch":{"k":"{{plot_1}}","d":"{{plot_5}}"}}}'
)
```

### ⚠️ Points Importants :
1. **Version** : `//@version=6` (obligatoire)
2. **Plots** : Chaque indicateur doit avoir un `plot()` avec un nom unique
3. **Message JSON** : Le message doit être un JSON valide avec les variables TradingView
4. **Variables TradingView** :
   - `{{ticker}}` → Nom du symbole (ex: TAOUSDT)
   - `{{close}}` → Prix de clôture actuel
   - `{{time}}` → Timestamp de la barre
   - `{{plot_0}}`, `{{plot_1}}`, etc. → Valeurs des indicateurs

---

## 🔧 Étape 2 : Créer l'Alerte dans TradingView

### 2.1 Ouvrir le Panneau d'Alertes
1. Clique sur **"Alertes"** en haut à droite de TradingView
2. Ou utilise le raccourci : **Ctrl/Cmd + Alt + A**

### 2.2 Créer une Nouvelle Alerte
1. Clique sur **"Créer"** ou **"Create"**
2. Sélectionne ton **graphique** (ex: TAOUSDT)
3. Sélectionne ton **script** (celui que tu viens de créer)

### 2.3 Configurer l'Alerte

#### **Condition d'Alerte**
- Sélectionne : **"Webhook Trading Alert (RSI)"** (le nom de ton `alertcondition`)

#### **Options**
- ✅ **Alerte une fois par barre** : Activé (pour éviter les doublons)
- ✅ **Alerte une fois par barre close** : Activé (pour attendre la clôture de la barre)

#### **Webhook URL** ⭐ IMPORTANT
```
https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/webhooks
```

**⚠️ IMPORTANT :** 
- Copie exactement cette URL (sans espaces)
- Pas de `/` à la fin
- Vérifie que c'est bien `https://` (pas `http://`)

#### **Message Webhook** ⭐ TRÈS IMPORTANT
Copie-colle **exactement** ce message (sans modifier les guillemets) :

```json
{"symbol":"{{ticker}}","price":{{close}},"time":"{{time}}","indicators":{"rsi":"{{plot_0}}","macd":{"macd":"{{plot_3}}","signal":"{{plot_4}}","histogram":"{{plot_2}}"},"stoch":{"k":"{{plot_1}}","d":"{{plot_5}}"}}}
```

**⚠️ Points Critiques :**
- ✅ Les guillemets doubles `"` sont obligatoires
- ✅ Pas de guillemets simples `'`
- ✅ Pas d'espaces avant/après les accolades
- ✅ Les variables `{{ticker}}`, `{{close}}`, etc. doivent être exactement comme ça

### 2.4 Sauvegarder l'Alerte
1. Clique sur **"Créer"** ou **"Create"**
2. L'alerte est maintenant active !

---

## ✅ Étape 3 : Tester l'Alerte

### 3.1 Déclencher l'Alerte Manuellement
1. Va dans **"Alertes"** → **"Mes Alertes"**
2. Trouve ton alerte
3. Clique sur **"Tester"** ou **"Test"**

### 3.2 Vérifier les Logs AWS
1. Va dans **AWS Console** → **CloudWatch** → **Log groups**
2. Cherche : `/aws/lambda/TradingStack-TradingViewWebhookHandler-XXXXX`
3. Regarde les logs récents

Tu devrais voir :
```
=== TRADINGVIEW WEBHOOK EVENT DEBUG ===
Event: {...}
Method: POST
Body: {"symbol":"TAOUSDT","price":300.5,"time":"2025-01-15T10:30:00Z",...}
✅ Parsed webhook data: {...}
```

### 3.3 Vérifier DynamoDB
1. Va dans **AWS Console** → **DynamoDB** → **Tables**
2. Sélectionne : `TradingStack-TradingAlertsTable-XXXXX`
3. Clique sur **"Explorer les éléments de table"**
4. Tu devrais voir ton alerte avec tous les indicateurs

---

## 🐛 Dépannage

### Problème : Alerte déclenchée mais pas de données dans AWS

#### ✅ Vérification 1 : URL du Webhook
- Vérifie que l'URL est correcte : `https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/webhooks`
- Teste avec curl :
```bash
curl -X POST https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/webhooks \
  -H "Content-Type: application/json" \
  -d '{"symbol":"TAOUSDT","price":300.5,"time":"2025-01-15T10:30:00Z","indicators":{"rsi":25.5}}'
```

#### ✅ Vérification 2 : Message Webhook
- Vérifie que le message JSON est valide
- Teste le JSON ici : https://jsonlint.com/
- Vérifie que les guillemets sont bien des `"` (pas `'`)

#### ✅ Vérification 3 : Logs CloudWatch
- Va dans CloudWatch → Log groups
- Cherche le log group de la Lambda
- Regarde les erreurs éventuelles

#### ✅ Vérification 4 : Script Pine
- Vérifie que tous les `plot()` sont bien définis
- Vérifie que les numéros de plot correspondent (plot_0, plot_1, etc.)
- Vérifie que la version est `//@version=6`

### Problème : Erreur "Invalid JSON format"

**Cause** : Le message TradingView n'est pas un JSON valide

**Solution** :
1. Vérifie que tous les guillemets sont des `"` (pas `'`)
2. Vérifie qu'il n'y a pas d'espaces avant/après les accolades
3. Teste le JSON sur https://jsonlint.com/

### Problème : Lambda ne reçoit pas le body

**Cause** : TradingView envoie le body en base64 ou format différent

**Solution** : Le code Lambda gère maintenant automatiquement le décodage base64. Vérifie les logs CloudWatch pour voir ce qui est reçu.

---

## 📊 Exemple de Message JSON Attendu

Quand TradingView envoie une alerte, le message devrait ressembler à :

```json
{
  "symbol": "TAOUSDT",
  "price": 300.5,
  "time": "2025-01-15T10:30:00Z",
  "indicators": {
    "rsi": "25.5",
    "macd": {
      "macd": "1.2",
      "signal": "0.8",
      "histogram": "0.4"
    },
    "stoch": {
      "k": "20.5",
      "d": "18.3"
    }
  }
}
```

**Note** : Les valeurs peuvent être des strings (le Lambda les convertit automatiquement en nombres).

---

## 🎯 Checklist de Configuration

- [ ] Script Pine Script créé avec `//@version=6`
- [ ] Tous les indicateurs ont un `plot()` avec un nom unique
- [ ] `alertcondition` créé avec le bon message JSON
- [ ] Alerte TradingView créée
- [ ] URL webhook correcte : `https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/webhooks`
- [ ] Message webhook copié exactement (JSON valide)
- [ ] Alerte testée manuellement
- [ ] Logs CloudWatch vérifiés
- [ ] DynamoDB vérifié (alerte sauvegardée)

---

## 📞 Support

Si tu as des problèmes :
1. Vérifie les logs CloudWatch
2. Teste l'endpoint avec curl
3. Vérifie que le JSON est valide
4. Partage les logs CloudWatch pour diagnostic

---

## 🔗 Liens Utiles

- **URL du Webhook** : `https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/webhooks`
- **URL pour récupérer les alertes** : `https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/alerts`
- **Documentation TradingView Webhooks** : https://www.tradingview.com/support/solutions/43000529348-webhooks/

