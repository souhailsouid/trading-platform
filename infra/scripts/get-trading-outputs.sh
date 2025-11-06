#!/bin/bash

# Script pour récupérer les outputs de TradingStack

echo "📋 Outputs de TradingStack :"
echo ""

aws cloudformation describe-stacks \
  --stack-name TradingStack \
  --query 'Stacks[0].Outputs' \
  --output json 2>/dev/null | \
  jq -r '.[] | "\(.OutputKey):\n   \(.OutputValue)\n"' || \
  echo "❌ Erreur: Stack non trouvé ou pas encore déployé"

echo ""
echo "🔗 URL du webhook à utiliser dans TradingView :"
aws cloudformation describe-stacks \
  --stack-name TradingStack \
  --query 'Stacks[0].Outputs[?OutputKey==`WebhookApiUrl`].OutputValue' \
  --output text 2>/dev/null || echo "   (non disponible)"

