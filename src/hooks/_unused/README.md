# 📦 Hooks Non Utilisés

Ce dossier contient les hooks qui ne sont pas actuellement utilisés dans l'application.

## Hooks archivés

### useRealtimeSignals.ts
- **Description** : Hook pour détecter les signaux de trading en temps réel
- **Dépendances** : `useBinanceKlinesWebSocket`, `useData`
- **Raison** : Non utilisé dans aucun composant

### useTradingAlerts.ts
- **Description** : Hook pour récupérer et gérer les alertes trading
- **Raison** : Remplacé par `useSendAlert` et `WebhookResults` avec `useQuery`

### useBinanceKlinesWebSocket.ts
- **Description** : Hook pour WebSocket des klines Binance
- **Dépendances** : Utilisé uniquement par `useRealtimeSignals`
- **Raison** : Non utilisé car `useRealtimeSignals` n'est pas utilisé

## Note

Si vous souhaitez réutiliser un de ces hooks :
1. Déplacez-le de `_unused/` vers `hooks/`
2. Importez-le dans le composant qui en a besoin
3. Vérifiez les dépendances et les types

