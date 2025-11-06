#!/bin/bash

# Script pour déployer UNIQUEMENT TradingStack (sans dépendances vers les autres stacks)

echo "🚀 Déploiement de TradingStack uniquement..."
echo ""

# Utiliser le fichier CDK séparé qui ne charge que TradingStack
npx ts-node --project tsconfig.cdk.json bin/trading-app.ts deploy TradingStackV2 --require-approval never

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📋 Pour récupérer l'URL du webhook :"
echo "   ./scripts/get-outputs.sh"
echo ""
echo "   Ou directement via AWS CLI :"
echo "   aws cloudformation describe-stacks --stack-name TradingStackV2 --query 'Stacks[0].Outputs[?OutputKey==\`WebhookApiUrl\`].OutputValue' --output text"
