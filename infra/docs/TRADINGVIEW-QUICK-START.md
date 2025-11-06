# 🚀 TradingView - Configuration Rapide

## 📋 Étape par Étape (5 minutes)

### 1️⃣ Créer le Script Pine Script

1. Va sur **TradingView**
2. Clique sur **"Pine Editor"** (en bas)
3. Clique sur **"New"** pour créer un nouveau script
4. **Copie-colle** le contenu du fichier `tradingview-webhook-ready.pine`
5. Clique sur **"Save"** et donne un nom (ex: "Webhook Alert RSI")

### 2️⃣ Appliquer le Script au Graphique

1. Clique sur **"Add to Chart"** dans le Pine Editor
2. Le script est maintenant appliqué à ton graphique
3. Tu devrais voir les indicateurs (RSI, MACD, Stochastique)

### 3️⃣ Créer l'Alerte

1. Clique sur **"Alertes"** (en haut à droite) ou **Ctrl/Cmd + Alt + A**
2. Clique sur **"Créer"** ou **"Create"**
3. Configure l'alerte :

#### **Condition**
- Sélectionne ton graphique (ex: TAOUSDT)
- Sélectionne ton script (celui que tu viens de créer)
- **Condition d'alerte** : `Webhook Trading Alert (RSI)`

#### **Options**
- ✅ **Alerte une fois par barre** : Activé
- ✅ **Alerte une fois par barre close** : Activé

#### **Webhook URL** ⭐
```
https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/webhooks
```

#### **Message Webhook** ⭐
Copie-colle **exactement** ceci (sans modifier) :

```json
{"symbol":"{{ticker}}","price":{{close}},"time":"{{time}}","indicators":{"rsi":"{{plot_0}}","macd":{"macd":"{{plot_3}}","signal":"{{plot_4}}","histogram":"{{plot_2}}"},"stoch":{"k":"{{plot_1}}","d":"{{plot_5}}"}}}
```

⚠️ **IMPORTANT** :
- Utilise des **guillemets doubles** `"` (pas `'`)
- Copie **exactement** tel quel (pas d'espaces supplémentaires)

### 4️⃣ Sauvegarder et Tester

1. Clique sur **"Créer"** ou **"Create"**
2. L'alerte est maintenant active !
3. Pour tester : Clique sur **"Tester"** dans la liste des alertes

---

## ✅ Vérification

### 1. Vérifier les Logs AWS
1. Va dans **AWS Console** → **CloudWatch** → **Log groups**
2. Cherche : `/aws/lambda/TradingStack-TradingViewWebhookHandler-XXXXX`
3. Regarde les logs récents

Tu devrais voir :
```
=== TRADINGVIEW WEBHOOK EVENT DEBUG ===
Body: {"symbol":"TAOUSDT","price":300.5,...}
✅ Parsed webhook data: {...}
```

### 2. Vérifier DynamoDB
1. Va dans **AWS Console** → **DynamoDB** → **Tables**
2. Sélectionne : `TradingStack-TradingAlertsTable-XXXXX`
3. Clique sur **"Explorer les éléments de table"**
4. Tu devrais voir ton alerte sauvegardée !

### 3. Récupérer les Alertes via API
```bash
curl https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/alerts
```

---

## 🐛 Problèmes Courants

### ❌ "No body provided" dans les logs
**Cause** : Le message webhook n'est pas correctement configuré

**Solution** :
1. Vérifie que le message JSON est exactement comme dans le guide
2. Vérifie que les guillemets sont des `"` (pas `'`)
3. Teste le JSON sur https://jsonlint.com/

### ❌ "Invalid JSON format"
**Cause** : Le JSON n'est pas valide

**Solution** :
1. Copie le message exactement depuis le guide
2. Vérifie qu'il n'y a pas d'espaces avant/après les accolades
3. Teste sur https://jsonlint.com/

### ❌ Lambda déclenchée mais pas de données
**Cause** : TradingView envoie le body en base64

**Solution** : Le code Lambda gère maintenant automatiquement le décodage base64. Vérifie les logs CloudWatch pour voir ce qui est reçu.

---

## 📞 URLs Importantes

- **Webhook URL** : `https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/webhooks`
- **Alerts API** : `https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod/alerts`

---

## 🎯 Checklist

- [ ] Script Pine Script créé et appliqué au graphique
- [ ] Alerte TradingView créée
- [ ] URL webhook correcte
- [ ] Message webhook copié exactement
- [ ] Alerte testée
- [ ] Logs CloudWatch vérifiés
- [ ] DynamoDB vérifié (alerte sauvegardée)

---

## 📚 Documentation Complète

Voir le fichier `TRADINGVIEW-SETUP-GUIDE.md` pour plus de détails.

