# Guide d'utilisation des Alertes TradingView

## Vue d'ensemble

Le système d'alertes TradingView permet d'afficher et de gérer les alertes envoyées depuis TradingView vers votre backend AWS.

## Fonctionnalités

### 1. Affichage des alertes
- Liste de toutes les alertes reçues
- Filtrage par symbole (ex: BTCUSDT, TAOUSDT)
- Filtrage par type d'alerte (RSI, MACD)
- Affichage des indicateurs techniques (RSI, MACD, Stochastic)
- Mise à jour automatique (optionnelle)

### 2. Envoi d'alertes de test
- Permet de tester le système sans passer par TradingView
- Simule une alerte RSI ou MACD
- Utile pour le développement et les tests

### 3. Rafraîchissement automatique
- Active/désactive la mise à jour automatique toutes les 10 secondes
- Indicateur visuel de l'état de connexion

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_TRADING_API_URL=https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod
```

### Utilisation

1. **Afficher les alertes** :
   - Le composant `TradingAlerts` est automatiquement ajouté à la page d'accueil
   - Les alertes s'affichent dans une carte avec toutes les informations

2. **Filtrer les alertes** :
   - Utilisez le champ "Symbole" pour filtrer par paire de trading
   - Utilisez le menu déroulant "Type d'alerte" pour filtrer par RSI ou MACD
   - Cliquez sur "Effacer" pour réinitialiser les filtres

3. **Rafraîchir manuellement** :
   - Cliquez sur l'icône de rafraîchissement pour mettre à jour les alertes

4. **Activer le rafraîchissement automatique** :
   - Cliquez sur l'icône de notification pour activer/désactiver
   - Les alertes se mettront à jour automatiquement toutes les 10 secondes

5. **Envoyer une alerte de test** :
   - Cliquez sur le bouton "Tester"
   - Remplissez le formulaire avec les informations de l'alerte
   - Cliquez sur "Envoyer"
   - L'alerte sera envoyée au backend et apparaîtra dans la liste

## Structure des données

### TradingAlert

```typescript
interface TradingAlert {
  id?: string;
  symbol: string;              // Ex: "BTCUSDT"
  price: number;               // Prix au moment de l'alerte
  timestamp: string;            // Date/heure de réception
  time: string;                // Date/heure du signal
  alertType?: 'RSI' | 'MACD';  // Type d'alerte
  signalType?: string;         // Type de signal MACD (si applicable)
  indicators: {
    rsi?: number;              // Valeur RSI
    macd?: {
      macd: number;
      signal: number;
      histogram: number;
    };
    stoch?: {
      k: number;
      d: number;
    };
  } | null;
}
```

## Types de signaux MACD

- `bullish_signal_crossover` : Croisement haussier de la ligne de signal
- `bearish_signal_crossover` : Croisement baissier de la ligne de signal
- `bullish_zero_crossover` : Croisement haussier de la ligne zéro
- `bearish_zero_crossover` : Croisement baissier de la ligne zéro
- `bullish_divergence` : Divergence haussière
- `bearish_divergence` : Divergence baissière

## Intégration dans votre application

Le composant `TradingAlerts` est déjà intégré dans `HomeScreen.tsx`. Si vous souhaitez l'utiliser ailleurs :

```tsx
import TradingAlerts from '../components/TradingAlerts';

function MyComponent() {
  return (
    <div>
      <TradingAlerts />
    </div>
  );
}
```

## Hook personnalisé

Vous pouvez également utiliser le hook `useTradingAlerts` directement :

```tsx
import { useTradingAlerts } from '../hooks/useTradingAlerts';

function MyComponent() {
  const { alerts, loading, error, refetch, sendTestAlert } = useTradingAlerts({
    symbol: 'BTCUSDT',
    limit: 20,
    alertType: 'RSI',
    autoRefresh: true,
    refreshInterval: 10000,
  });

  // Utiliser les données...
}
```

## Dépannage

### Les alertes ne s'affichent pas
1. Vérifiez que l'URL de l'API est correcte dans `.env`
2. Vérifiez la console du navigateur pour les erreurs
3. Vérifiez que le backend est déployé et accessible

### Le rafraîchissement automatique ne fonctionne pas
- Vérifiez que l'icône de notification est verte (activée)
- Vérifiez la console pour les erreurs de réseau

### L'envoi d'alerte de test échoue
- Vérifiez que tous les champs sont remplis
- Vérifiez que le backend accepte les requêtes POST
- Vérifiez la console pour les erreurs détaillées

