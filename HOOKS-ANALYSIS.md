# 🔍 Analyse des Hooks - Utilisation

## ✅ Hooks Utilisés

### 1. **useFetchCurrencyPair**
- **Utilisé dans** : `src/components/Form.tsx`
- **Status** : ✅ Utilisé
- **Action** : Garder

### 2. **useSubmitForm**
- **Utilisé dans** : `src/components/Form.tsx`
- **Status** : ✅ Utilisé
- **Action** : Garder

### 3. **useSendAlert**
- **Utilisé dans** : `src/components/SendAlertForm.tsx`
- **Status** : ✅ Utilisé
- **Action** : Garder

### 4. **useBinanceWebSocket**
- **Utilisé dans** : `src/components/ui/headers/MarketInfo.tsx`
- **Status** : ✅ Utilisé
- **Action** : Garder

## ❌ Hooks Non Utilisés

### 1. **useRealtimeSignals**
- **Défini dans** : `src/hooks/useRealtimeSignals.ts`
- **Utilisé dans** : ❌ Aucun composant
- **Dépendances** : Utilise `useBinanceKlinesWebSocket` et `useData`
- **Status** : ❌ Non utilisé
- **Action** : Déplacer vers `_unused` ou supprimer

### 2. **useTradingAlerts**
- **Défini dans** : `src/hooks/useTradingAlerts.ts`
- **Utilisé dans** : ❌ Aucun composant
- **Note** : Remplacé par `useSendAlert` et `WebhookResults` avec `useQuery`
- **Status** : ❌ Non utilisé
- **Action** : Déplacer vers `_unused` ou supprimer

### 3. **useBinanceKlinesWebSocket**
- **Défini dans** : `src/hooks/useBinanceKlinesWebSocket.ts`
- **Utilisé dans** : Seulement dans `useRealtimeSignals` (qui n'est pas utilisé)
- **Status** : ⚠️ Indirectement non utilisé
- **Action** : Déplacer vers `_unused` si `useRealtimeSignals` est supprimé

## 📊 Résumé

| Hook | Utilisé | Action |
|------|---------|--------|
| useFetchCurrencyPair | ✅ Oui | Garder |
| useSubmitForm | ✅ Oui | Garder |
| useSendAlert | ✅ Oui | Garder |
| useBinanceWebSocket | ✅ Oui | Garder |
| useRealtimeSignals | ❌ Non | Déplacer/Supprimer |
| useTradingAlerts | ❌ Non | Déplacer/Supprimer |
| useBinanceKlinesWebSocket | ⚠️ Non (indirect) | Déplacer/Supprimer |

## 🎯 Recommandation

Déplacer les hooks non utilisés vers `src/hooks/_unused/` pour :
1. Garder le code au cas où vous en auriez besoin plus tard
2. Nettoyer le dossier hooks pour ne garder que ce qui est utilisé
3. Faciliter la maintenance

