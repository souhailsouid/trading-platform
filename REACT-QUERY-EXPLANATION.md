# 📚 Explication Simple : React Query et useMemo

## 🎯 Vue d'ensemble

Ces outils aident à gérer les données dans votre application React de manière plus simple et efficace.

---

## 1️⃣ useQuery - "Récupérer des données"

### 🤔 Qu'est-ce que c'est ?

`useQuery` est un hook qui **récupère des données** depuis une API (comme un serveur web).

### 📝 Analogie simple

Imagine que vous voulez savoir le prix d'une crypto-monnaie :
- **Sans useQuery** : Vous devez vous-même appeler l'API, gérer le chargement, les erreurs, etc.
- **Avec useQuery** : React Query fait tout ça pour vous automatiquement !

### 💻 Exemple dans votre code

```typescript
const { data: alerts = [], isLoading: loading, error: queryError } = useQuery({
  queryKey: ['webhookAlerts'],  // 🔑 Clé unique pour identifier ces données
  queryFn: () => tradingAlertsService.getAllAlerts(),  // 📞 Fonction qui récupère les données
});
```

### 🔍 Décortiquons :

- **`queryKey: ['webhookAlerts']`** : 
  - C'est comme un **nom de dossier** pour ces données
  - Si vous utilisez la même clé ailleurs, React Query sait que c'est les mêmes données
  - Utile pour rafraîchir automatiquement les données

- **`queryFn`** : 
  - C'est la **fonction qui va chercher les données**
  - Ici, elle appelle `getAllAlerts()` qui fait une requête HTTP

- **`data`** : 
  - Les **données récupérées** (ici, la liste des alertes)
  - `= []` signifie "si pas de données, utilise un tableau vide"

- **`isLoading`** : 
  - `true` = les données sont en train de charger
  - `false` = les données sont chargées

- **`error`** : 
  - Si une erreur se produit (pas de connexion, serveur down, etc.)

### ✅ Avantages

1. **Cache automatique** : Les données sont mises en cache, pas besoin de les recharger à chaque fois
2. **Rafraîchissement automatique** : Si les données changent, React Query les met à jour
3. **Gestion d'erreurs** : Gère automatiquement les erreurs
4. **États de chargement** : Vous savez toujours si les données sont en train de charger

---

## 2️⃣ useMutation - "Envoyer/Modifier des données"

### 🤔 Qu'est-ce que c'est ?

`useMutation` est un hook qui **envoie des données** ou **modifie des données** sur le serveur (POST, PUT, DELETE).

### 📝 Analogie simple

- **useQuery** = Lire un livre (GET)
- **useMutation** = Écrire dans un livre (POST/PUT/DELETE)

### 💻 Exemple dans votre code

```typescript
const { mutate, isPending, isSuccess, isError, error } = useSendAlert();
```

Dans `useSendAlert.ts` :

```typescript
const mutation = useMutation({
  mutationFn: (alert: Partial<TradingAlert>) => tradingAlertsService.sendTestAlert(alert),
  onSuccess: () => {
    // Quand l'envoi réussit, on rafraîchit la liste des alertes
    queryClient.invalidateQueries({ queryKey: ['webhookAlerts'] });
  },
});
```

### 🔍 Décortiquons :

- **`mutationFn`** : 
  - La **fonction qui envoie les données** au serveur
  - Ici, elle envoie une alerte via `sendTestAlert()`

- **`onSuccess`** : 
  - Ce qui se passe **après un envoi réussi**
  - Ici, on rafraîchit la liste des alertes pour voir la nouvelle alerte

- **`mutate`** : 
  - La **fonction à appeler** pour envoyer les données
  - Exemple : `mutate({ symbol: 'BTCUSDT', price: 50000 })`

- **`isPending`** : 
  - `true` = l'envoi est en cours
  - `false` = l'envoi est terminé

- **`isSuccess`** : 
  - `true` = l'envoi a réussi

- **`isError`** : 
  - `true` = une erreur s'est produite

### ✅ Avantages

1. **Gestion automatique des états** : Vous savez toujours si l'envoi est en cours, réussi, ou échoué
2. **Rafraîchissement automatique** : Après un envoi réussi, vous pouvez rafraîchir les données
3. **Retry automatique** : Peut réessayer automatiquement en cas d'échec

---

## 3️⃣ useMemo - "Mémoriser un calcul"

### 🤔 Qu'est-ce que c'est ?

`useMemo` **mémorise le résultat d'un calcul** pour éviter de le refaire inutilement.

### 📝 Analogie simple

Imagine que vous calculez le total de vos achats :
- **Sans useMemo** : Vous recalculez à chaque fois, même si rien n'a changé
- **Avec useMemo** : Vous ne recalculez que si les prix ont changé

### 💻 Exemple dans votre code

```typescript
const visibleRows = useMemo(
  () => {
    const sorted = sortAlerts(alerts, order, orderBy, getTradingAlertValue);
    return sorted.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  },
  [order, orderBy, page, alerts, rowsPerPage],  // 🔑 Dépendances
);
```

### 🔍 Décortiquons :

- **Premier paramètre** : 
  - Une **fonction qui fait le calcul**
  - Ici, elle trie les alertes et prend seulement celles de la page actuelle

- **Deuxième paramètre** : 
  - La **liste des dépendances**
  - Si une de ces valeurs change, le calcul est refait
  - Si aucune ne change, le résultat précédent est réutilisé

### ✅ Avantages

1. **Performance** : Évite les calculs inutiles
2. **Optimisation** : Surtout utile pour des calculs coûteux (tri de grandes listes, etc.)

### ⚠️ Quand l'utiliser ?

- ✅ Quand vous avez un **calcul coûteux** (tri, filtrage de grandes listes)
- ✅ Quand vous voulez **éviter des re-renders inutiles**
- ❌ Pas besoin pour des calculs simples (addition, concaténation de strings)

---

## 🔄 Comment ils travaillent ensemble

### Scénario : Envoyer une alerte et voir le résultat

1. **L'utilisateur remplit le formulaire** et clique sur "Send Alert"

2. **useMutation envoie l'alerte** :
   ```typescript
   mutate({ symbol: 'BTCUSDT', price: 50000, rsi: 32 })
   ```

3. **Quand l'envoi réussit** (`onSuccess`), on invalide la query :
   ```typescript
   queryClient.invalidateQueries({ queryKey: ['webhookAlerts'] });
   ```

4. **useQuery détecte l'invalidation** et **refait automatiquement** la requête pour récupérer les nouvelles données

5. **useMemo recalcule** les lignes visibles avec les nouvelles données

6. **L'interface se met à jour** automatiquement ! ✨

---

## 📊 Résumé visuel

```
┌─────────────────────────────────────────────────┐
│  useQuery                                      │
│  "Je récupère les données"                     │
│  GET /alerts → [alerte1, alerte2, ...]        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  useMemo                                        │
│  "Je trie et filtre les données"               │
│  [alerte1, alerte2, ...] → [alerte2, alerte1] │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Affichage dans le tableau                      │
│  [alerte2, alerte1] → Table HTML               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  useMutation                                    │
│  "J'envoie une nouvelle alerte"                 │
│  POST /webhooks → { success: true }            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Invalidation de la query                      │
│  "Les données ont changé, recharge-les !"     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  useQuery se relance automatiquement           │
│  GET /alerts → [alerte1, alerte2, alerte3]    │
└─────────────────────────────────────────────────┘
```

---

## 🎓 Points clés à retenir

1. **useQuery** = Lire des données (GET)
2. **useMutation** = Écrire/Modifier des données (POST/PUT/DELETE)
3. **useMemo** = Mémoriser un calcul coûteux
4. **Ils travaillent ensemble** pour créer une expérience utilisateur fluide

---

## 💡 Questions fréquentes

**Q : Pourquoi utiliser useQuery au lieu de fetch() ?**
R : useQuery gère automatiquement le cache, le rafraîchissement, les erreurs, etc. C'est beaucoup moins de code à écrire !

**Q : Quand utiliser useMemo ?**
R : Quand vous avez un calcul qui prend du temps (tri de 1000+ éléments) ou qui est appelé souvent.

**Q : useQuery se relance-t-il automatiquement ?**
R : Oui, si vous invalidez la query (avec `invalidateQueries`), elle se relance automatiquement.

---

## 📚 Ressources pour aller plus loin

- [React Query Documentation](https://tanstack.com/query/latest)
- [React useMemo Hook](https://react.dev/reference/react/useMemo)

