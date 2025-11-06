#!/bin/bash

# Script pour ajouter un bot Telegram dans DynamoDB

echo "🤖 Configuration d'un bot Telegram pour les alertes trading"
echo ""

# Vérifier si les variables sont définies
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
  echo "Usage: $0 <SYMBOL> <CHAT_ID> <BOT_TOKEN>"
  echo ""
  echo "Exemple:"
  echo "  $0 TAOUSDT 123456789 8327759989:AAGa8KWU5jJX8Tarm_hLGvkM38Vipgcr8EY"
  echo ""
  echo "Pour obtenir votre Chat ID:"
  echo "  1. Commencez une conversation avec votre bot sur Telegram"
  echo "  2. Envoyez un message à votre bot"
  echo "  3. Visitez: https://api.telegram.org/bot<TOKEN>/getUpdates"
  echo "  4. Cherchez \"chat\":{\"id\":XXXXX} dans la réponse"
  exit 1
fi

SYMBOL=$1
CHAT_ID=$2
BOT_TOKEN=$3

# Récupérer le nom de la table DynamoDB
TABLE_NAME=$(aws cloudformation describe-stacks \
  --stack-name TradingStack \
  --query 'Stacks[0].Outputs[?OutputKey==`TelegramBotsTableName`].OutputValue' \
  --output text 2>/dev/null)

# Si la table n'est pas dans les outputs, chercher par nom
if [ -z "$TABLE_NAME" ] || [ "$TABLE_NAME" == "None" ]; then
  echo "📋 Recherche de la table TelegramBotsTable..."
  TABLE_NAME=$(aws dynamodb list-tables --query "TableNames[?contains(@, 'TelegramBotsTable')]" --output text | head -1)
fi

if [ -z "$TABLE_NAME" ]; then
  echo "❌ Erreur: Table TelegramBotsTable non trouvée"
  echo "   Assurez-vous que TradingStack est déployé"
  exit 1
fi

echo "✅ Table trouvée: $TABLE_NAME"
echo ""
echo "📝 Ajout du bot Telegram pour $SYMBOL..."
echo "   Chat ID: $CHAT_ID"
echo "   Bot Token: ${BOT_TOKEN:0:20}..."
echo ""

# Ajouter l'item dans DynamoDB
aws dynamodb put-item \
  --table-name "$TABLE_NAME" \
  --item "{
    \"symbol\": {\"S\": \"$SYMBOL\"},
    \"chat_id\": {\"S\": \"$CHAT_ID\"},
    \"bot_token\": {\"S\": \"$BOT_TOKEN\"}
  }" \
  --return-consumed-capacity TOTAL

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Bot Telegram ajouté avec succès !"
  echo ""
  echo "📱 Pour tester:"
  echo "   1. Déclenchez une alerte depuis TradingView"
  echo "   2. Vous devriez recevoir un message Telegram"
  echo ""
else
  echo ""
  echo "❌ Erreur lors de l'ajout du bot"
  exit 1
fi

