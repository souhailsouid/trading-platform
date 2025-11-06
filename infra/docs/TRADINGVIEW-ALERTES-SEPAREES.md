# 📊 Alertes TradingView Séparées : RSI et MACD

## 🎯 Vue d'ensemble

Vous avez maintenant **deux scripts Pine Script séparés** pour simplifier la gestion des alertes :

1. **`tradingview-rsi-alert.pine`** - Alerte RSI uniquement
2. **`tradingview-macd-alert.pine`** - Alerte MACD avec tous les signaux

## 📉 Alerte RSI

### Script : `tradingview-rsi-alert.pine`

**Condition d'alerte :** RSI < 30 (configurable)

**Message webhook envoyé :**
```json
{
  "alertType": "RSI",
  "symbol": "TAOUSDT",
  "price": 395.4,
  "time": "2025-11-05T14:00:00Z",
  "indicators": {
    "rsi": 28.5
  }
}
```

### Configuration dans TradingView

1. **Copier le script** `tradingview-rsi-alert.pine` dans TradingView
2. **Créer une alerte** avec :
   - **Condition** : `Webhook RSI Alert`
   - **Message** : Copier exactement le contenu de `webhookMessage` (ligne 31)
   - **Webhook URL** : Votre URL Lambda

### Paramètres configurables

- **RSI Threshold** : Seuil RSI (défaut: 30.0)

---

## 📈 Alerte MACD

### Script : `tradingview-macd-alert.pine`

**Conditions d'alerte :**
- ✅ Croisement haussier de la ligne de signal (MACD croise au-dessus de la ligne de signal)
- ✅ Croisement baissier de la ligne de signal (MACD croise en-dessous de la ligne de signal)
- ✅ Croisement haussier de la ligne zéro (MACD passe de négatif à positif)
- ✅ Croisement baissier de la ligne zéro (MACD passe de positif à négatif)
- ✅ Divergence haussière (simplifiée)
- ✅ Divergence baissière (simplifiée)

**Message webhook envoyé :**
```json
{
  "alertType": "MACD",
  "signalType": "bullish_signal_crossover",
  "symbol": "TAOUSDT",
  "price": 395.4,
  "time": "2025-11-05T14:00:00Z",
  "indicators": {
    "macd": {
      "macd": 0.0813,
      "signal": 0.0337,
      "histogram": 0.0476
    }
  }
}
```

### Types de signaux MACD

| Signal Type | Description |
|------------|-------------|
| `bullish_signal_crossover` | MACD croise au-dessus de la ligne de signal |
| `bearish_signal_crossover` | MACD croise en-dessous de la ligne de signal |
| `bullish_zero_crossover` | MACD croise au-dessus de zéro (devient positif) |
| `bearish_zero_crossover` | MACD croise en-dessous de zéro (devient négatif) |
| `bullish_divergence` | Divergence haussière détectée |
| `bearish_divergence` | Divergence baissière détectée |

### Configuration dans TradingView

1. **Copier le script** `tradingview-macd-alert.pine` dans TradingView
2. **Créer une alerte** avec :
   - **Condition** : `Webhook MACD Alert`
   - **Message** : Copier exactement le contenu de `webhookMessage` (ligne 54-57)
   - **Webhook URL** : Votre URL Lambda

### Paramètres configurables

- **MACD Fast Length** : Longueur EMA rapide (défaut: 12)
- **MACD Slow Length** : Longueur EMA lente (défaut: 26)
- **MACD Signal Length** : Longueur EMA signal (défaut: 9)

---

## 🔧 Avantages de cette approche

### ✅ Simplicité
- **Chaque alerte est indépendante** : RSI et MACD sont séparés
- **Plus facile à configurer** : Un script = un indicateur
- **Moins de complexité** : Pas besoin de gérer plusieurs indicateurs dans un seul script

### ✅ Flexibilité
- **RSI** : Vous pouvez configurer le seuil RSI selon vos besoins
- **MACD** : Tous les signaux MACD sont détectés automatiquement
- **Alertes multiples** : Vous pouvez créer plusieurs alertes pour le même indicateur avec des seuils différents

### ✅ Clarté dans les logs
- **Chaque alerte est identifiée** par `alertType: "RSI"` ou `alertType: "MACD"`
- **Les signaux MACD sont identifiés** par `signalType` (bullish_signal_crossover, etc.)
- **Notifications Slack/Email** incluent le type d'alerte et le signal

---

## 📋 Structure des données dans DynamoDB

### Alerte RSI
```json
{
  "id": "uuid",
  "timestamp": "2025-11-05T15:00:00.000Z",
  "alertType": "RSI",
  "symbol": "TAOUSDT",
  "price": 395.4,
  "time": "2025-11-05T14:00:00Z",
  "status": "PROCESSED",
  "indicators": {
    "rsi": 28.5
  }
}
```

### Alerte MACD
```json
{
  "id": "uuid",
  "timestamp": "2025-11-05T15:00:00.000Z",
  "alertType": "MACD",
  "signalType": "bullish_signal_crossover",
  "symbol": "TAOUSDT",
  "price": 395.4,
  "time": "2025-11-05T14:00:00Z",
  "status": "PROCESSED",
  "indicators": {
    "macd": {
      "macd": 0.0813,
      "signal": 0.0337,
      "histogram": 0.0476
    }
  }
}
```

---

## 🚀 Démarrage rapide

### 1. RSI Alert

```bash
# 1. Copier le contenu de tradingview-rsi-alert.pine dans TradingView
# 2. Créer une alerte avec :
#    - Condition: Webhook RSI Alert
#    - Message: Copier le webhookMessage du script
#    - Webhook URL: Votre URL Lambda
```

### 2. MACD Alert

```bash
# 1. Copier le contenu de tradingview-macd-alert.pine dans TradingView
# 2. Créer une alerte avec :
#    - Condition: Webhook MACD Alert
#    - Message: Copier le webhookMessage du script
#    - Webhook URL: Votre URL Lambda
```

---

## 📝 Notes importantes

### ⚠️ Message webhook dans TradingView

**IMPORTANT :** Le message webhook doit être copié **exactement** comme dans le script Pine. Ne pas modifier les variables `{{ticker}}`, `{{close}}`, `{{time}}`, `{{plot_X}}`.

### ⚠️ Gestion des valeurs `null`/`NaN`

- Si une valeur MACD est `na` (non disponible) en Pine Script, TradingView enverra `NaN`
- Le Lambda convertit automatiquement `NaN` → `null` et filtre les valeurs invalides
- Les propriétés avec `null` ne sont **pas sauvegardées** dans DynamoDB

### ⚠️ Signal Type dans MACD

Le `signalType` est déterminé dynamiquement par le script Pine Script. Si plusieurs signaux se déclenchent en même temps, le script priorise dans cet ordre :
1. `bullish_signal_crossover`
2. `bearish_signal_crossover`
3. `bullish_zero_crossover`
4. `bearish_zero_crossover`
5. `bullish_divergence`
6. `bearish_divergence`

---

## 🔍 Vérification

Après avoir configuré une alerte, vérifiez les logs CloudWatch pour confirmer que :
1. ✅ L'alerte est reçue par le Lambda
2. ✅ Les données sont parsées correctement
3. ✅ `alertType` et `signalType` sont présents
4. ✅ Les données sont sauvegardées dans DynamoDB

---

## 📚 Ressources

- [Documentation TradingView Alerts](https://www.tradingview.com/support/solutions/43000529348-webhooks/)
- [Documentation MACD](https://www.tradingview.com/support/solutions/43000501826-macd-moving-average-convergence-divergence/)
- [Documentation RSI](https://www.tradingview.com/support/solutions/43000501824-relative-strength-index-rsi/)

