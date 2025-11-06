#!/bin/bash

# Script pour obtenir votre Chat ID Telegram

if [ -z "$1" ]; then
  echo "Usage: $0 <BOT_TOKEN>"
  echo ""
  echo "Exemple:"
  echo "  $0 8327759989:AAGa8KWU5jJX8Tarm_hLGvkM38Vipgcr8EY"
  exit 1
fi

BOT_TOKEN=$1

echo "🤖 Récupération de votre Chat ID Telegram..."
echo ""
echo "📝 Instructions:"
echo "   1. Commencez une conversation avec votre bot sur Telegram"
echo "   2. Envoyez un message à votre bot (ex: /start ou Hello)"
echo "   3. Appuyez sur Entrée pour continuer..."
echo ""
read -p "Appuyez sur Entrée après avoir envoyé un message à votre bot..."

echo ""
echo "🔍 Recherche de votre Chat ID..."
echo ""

# Récupérer les updates
RESPONSE=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getUpdates")

# Extraire le Chat ID
CHAT_ID=$(echo "$RESPONSE" | jq -r '.result[] | select(.message) | .message.chat.id' | head -1)

if [ -z "$CHAT_ID" ] || [ "$CHAT_ID" == "null" ]; then
  echo "❌ Aucun Chat ID trouvé"
  echo ""
  echo "⚠️  Assurez-vous que:"
  echo "   1. Vous avez envoyé un message à votre bot"
  echo "   2. Le token du bot est correct"
  echo ""
  echo "📋 Réponse complète:"
  echo "$RESPONSE" | jq '.'
  exit 1
fi

echo "✅ Chat ID trouvé: $CHAT_ID"
echo ""
echo "📝 Pour ajouter le bot dans DynamoDB, utilisez:"
echo "   ./scripts/add-telegram-bot.sh <SYMBOL> $CHAT_ID $BOT_TOKEN"
echo ""
echo "   Exemple:"
echo "   ./scripts/add-telegram-bot.sh TAOUSDT $CHAT_ID $BOT_TOKEN"

