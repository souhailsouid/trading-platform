# API Trading Alerts

API simple pour récupérer les alertes trading stockées dans DynamoDB avec indicateurs techniques.

## 🚀 Déploiement

```bash
cd lib/functions/get-trading-alerts
npm install
npm run deploy
```

## 📡 Endpoints

### 1. Récupérer toutes les alertes

```bash
GET /alerts
```

**Réponse :**
```json
{
  "success": true,
  "count": 2,
  "alerts": [
    {
      "symbol": "BTCUSDT",
      "price": 68123.50,
      "timestamp": "2025-01-15T14:30:25Z",
      "time": "2025-01-15T14:30:25Z",
      "indicators": {
        "rsi": 65.42,
        "macd": {
          "macd": 0.0025,
          "signal": 0.0018,
          "histogram": 0.0007
        },
        "stoch": {
          "k": 78.5,
          "d": 72.3
        }
      }
    },
    {
      "symbol": "ETHUSDT",
      "price": 2450.75,
      "timestamp": "2025-01-15T14:25:10Z",
      "time": "2025-01-15T14:25:10Z",
      "indicators": null
    }
  ]
}
```

### 2. Récupérer les alertes d'un symbole spécifique

```bash
GET /alerts?symbol=BTCUSDT
```

### 3. Limiter le nombre de résultats

```bash
GET /alerts?limit=10
```

### 4. Combiner les filtres

```bash
GET /alerts?symbol=BTCUSDT&limit=5
```

## 🔧 Paramètres de requête

- `symbol` : Filtrer par symbole (ex: BTCUSDT, ETHUSDT)
- `limit` : Limiter le nombre de résultats (ex: 10, 50, 100)

## 📊 Indicateurs techniques disponibles

### RSI (Relative Strength Index)
- `rsi` : Valeur RSI (0-100)

### MACD (Moving Average Convergence Divergence)
- `macd.macd` : Ligne MACD
- `macd.signal` : Ligne de signal
- `macd.histogram` : Histogramme MACD

### Stochastique
- `stoch.k` : Ligne %K
- `stoch.d` : Ligne %D

## 📊 Exemple d'utilisation

```bash
# Récupérer toutes les alertes
curl https://your-api-gateway-url/alerts

# Récupérer les alertes BTCUSDT
curl https://your-api-gateway-url/alerts?symbol=BTCUSDT

# Récupérer les 10 dernières alertes
curl https://your-api-gateway-url/alerts?limit=10

# Récupérer les 5 dernières alertes BTCUSDT
curl https://your-api-gateway-url/alerts?symbol=BTCUSDT&limit=5
```

## 🎯 Format de réponse

Chaque alerte contient :
- `symbol` : Le symbole (ex: BTCUSDT)
- `price` : Le prix au moment de l'alerte
- `timestamp` : Timestamp de création de l'alerte
- `time` : Timestamp de l'événement trading
- `indicators` : Objet contenant les indicateurs techniques (peut être null)

## 📡 Configuration TradingView

Pour envoyer les indicateurs depuis TradingView, utilisez ce JSON :

```json
{
  "symbol": "{{ticker}}",
  "price": "{{close}}",
  "time": "{{time}}",
  "indicators": {
    "rsi": "{{rsi}}",
    "macd": {
      "macd": "{{macd}}",
      "signal": "{{macd_signal}}",
      "histogram": "{{macd_histogram}}"
    },
    "stoch": {
      "k": "{{stoch_k}}",
      "d": "{{stoch_d}}"
    }
  }
}
```

## 🔒 Sécurité

- CORS activé pour les requêtes cross-origin
- Seules les requêtes GET sont autorisées
- Accès en lecture seule à DynamoDB 