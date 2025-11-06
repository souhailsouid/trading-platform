#!/bin/bash

# Script pour tester le webhook (simuler une alerte TradingView)

echo "🧪 Test du Webhook TradingView"
echo ""

# Récupérer l'URL du webhook
WEBHOOK_URL=$(aws cloudformation describe-stacks \
  --stack-name TradingStack \
  --query 'Stacks[0].Outputs[?OutputKey==`WebhookApiUrl`].OutputValue' \
  --output text 2>/dev/null)

if [ -z "$WEBHOOK_URL" ] || [ "$WEBHOOK_URL" == "None" ]; then
  echo "❌ Erreur: Webhook URL non trouvée"
  echo "   Assurez-vous que le stack est déployé :"
  echo "   npm run deploy"
  exit 1
fi

echo "✅ Webhook URL trouvée: $WEBHOOK_URL"
echo ""

# Créer un payload de test (alerte RSI)
TEST_PAYLOAD='{
  "alertType": "RSI",
  "symbol": "TAOUSDT",
  "price": 395.4,
  "time": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
  "indicators": {
    "rsi": 28.5
  }
}'

echo "📤 Envoi d'une alerte de test (RSI)..."
echo "   Payload:"
echo "$TEST_PAYLOAD" | jq '.'
echo ""

response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$TEST_PAYLOAD" \
  "$WEBHOOK_URL")

http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" == "200" ]; then
  echo "   ✅ Succès (HTTP $http_code)"
  echo "   Réponse:"
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
  echo ""
  echo "✅ Alerte envoyée avec succès !"
  echo "   Vérifiez DynamoDB et les logs CloudWatch pour confirmer."
else
  echo "   ❌ Erreur (HTTP $http_code)"
  echo "   Réponse:"
  echo "$body"
fi

