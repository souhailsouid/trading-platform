#!/bin/bash

# Script pour préparer le projet pour la présentation
# Usage: ./prepare-for-presentation.sh [nouveau-repo-url]

set -e

echo "🚀 Préparation du projet pour la présentation..."

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le répertoire racine du projet"
    exit 1
fi

# 2. Ajouter tous les fichiers
echo -e "${BLUE}📦 Ajout des fichiers au staging...${NC}"
git add -A

# 3. Vérifier s'il y a des changements à commiter
if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  Aucun changement à commiter${NC}"
else
    # 4. Créer un commit
    echo -e "${BLUE}💾 Création du commit...${NC}"
    git commit -m "feat: Ajout des fonctionnalités de trading en temps réel

- Détection automatique de signaux (MACD, RSI, Stochastic, Bollinger)
- WebSocket Binance pour les klines en temps réel
- Graphiques techniques (MACD, Stochastic) avec visibilité améliorée
- Système d'alertes en temps réel
- Tests unitaires (Jest) et E2E (Cypress) configurés
- README complet avec documentation"

    echo -e "${GREEN}✅ Commit créé avec succès${NC}"
fi

# 5. Demander si l'utilisateur veut créer un nouveau repo
if [ -z "$1" ]; then
    echo -e "${YELLOW}📝 Pour créer un nouveau repo GitHub:${NC}"
    echo "   1. Créez un nouveau repo sur GitHub"
    echo "   2. Exécutez: git remote add presentation <nouveau-repo-url>"
    echo "   3. Exécutez: git push presentation main"
    echo ""
    echo -e "${BLUE}Ou exécutez ce script avec l'URL du nouveau repo:${NC}"
    echo "   ./prepare-for-presentation.sh <nouveau-repo-url>"
else
    # Ajouter le nouveau remote
    echo -e "${BLUE}🔗 Ajout du nouveau remote...${NC}"
    git remote add presentation "$1" 2>/dev/null || git remote set-url presentation "$1"
    
    echo -e "${BLUE}📤 Push vers le nouveau repo...${NC}"
    git push presentation main
    
    echo -e "${GREEN}✅ Projet poussé vers le nouveau repo avec succès!${NC}"
fi

# 6. Optionnel: Inclure l'infrastructure
read -p "Voulez-vous inclure l'infrastructure AWS CDK (trading-backend-cdk) dans ce repo? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}📁 Copie de l'infrastructure...${NC}"
    
    # Créer un dossier infra dans le repo actuel
    if [ ! -d "infra" ]; then
        mkdir -p infra
    fi
    
    # Copier les fichiers essentiels de l'infrastructure
    cp -r /Users/souhailsouid/trading-backend-cdk/* infra/ 2>/dev/null || true
    cp -r /Users/souhailsouid/trading-backend-cdk/.* infra/ 2>/dev/null || true
    
    # Nettoyer les fichiers inutiles
    rm -rf infra/node_modules infra/cdk.out infra/.git 2>/dev/null || true
    
    echo -e "${GREEN}✅ Infrastructure copiée dans le dossier infra/${NC}"
    echo -e "${YELLOW}⚠️  N'oubliez pas de commiter les fichiers de l'infrastructure${NC}"
fi

echo ""
echo -e "${GREEN}✨ Préparation terminée!${NC}"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Vérifiez que tous les fichiers sont bien commités"
echo "   2. Créez un nouveau repo GitHub si nécessaire"
echo "   3. Push vers le nouveau repo"
echo "   4. Préparez votre présentation!"

