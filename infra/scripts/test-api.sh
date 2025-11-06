#!/bin/bash

# Script pour tester les APIs après déploiement

echo "🧪 Test des APIs Trading Backend"
echo ""

# Récupérer l'URL de l'API
API_URL=$(aws cloudformation describe-stacks \
  --stack-name TradingStack \
  --query 'Stacks[0].Outputs[?OutputKey==`AlertsApiUrl`].OutputValue' \
  --output text 2>/dev/null)

if [ -z "$API_URL" ] || [ "$API_URL" == "None" ]; then
  echo "❌ Erreur: API URL non trouvée"
  echo "   Assurez-vous que le stack est déployé :"
  echo "   npm run deploy"
  exit 1
fi

echo "✅ API URL trouvée: $API_URL"
echo ""

# Test 1: Récupérer toutes les alertes
echo "📊 Test 1: Récupérer toutes les alertes"
echo "   GET $API_URL"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" == "200" ]; then
  echo "   ✅ Succès (HTTP $http_code)"
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
  echo "   ❌ Erreur (HTTP $http_code)"
  echo "$body"
fi

echo ""
echo ""

# Test 2: Récupérer les alertes d'un symbole spécifique
echo "📊 Test 2: Récupérer les alertes pour TAOUSDT"
echo "   GET $API_URL?symbol=TAOUSDT"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL?symbol=TAOUSDT")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" == "200" ]; then
  echo "   ✅ Succès (HTTP $http_code)"
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
  echo "   ❌ Erreur (HTTP $http_code)"
  echo "$body"
fi

echo ""
echo ""

# Test 3: Récupérer les alertes avec limite
echo "📊 Test 3: Récupérer 5 alertes"
echo "   GET $API_URL?limit=5"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL?limit=5")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" == "200" ]; then
  echo "   ✅ Succès (HTTP $http_code)"
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
  echo "   ❌ Erreur (HTTP $http_code)"
  echo "$body"
fi

echo ""
echo "✅ Tests terminés !"

