# Data & State Management Rules

## Zustand Stores
- Location: `src/stores/{storeName}.ts`
- One store per domain: `uiStore`, `variantStore`, `alertStore`, `preferencesStore`
- Use immer middleware for complex nested updates
- Never store API/server data in Zustand — that belongs in React Query cache
- Export typed hooks: `export const useUiStore = create<UiStore>(...)`

## Store Patterns
```typescript
// Always define interface first
interface UiStore {
  sidebarOpen: boolean;
  activeVariant: 'solana' | 'defi' | 'meme' | 'dev';
  toggleSidebar: () => void;
  setVariant: (v: UiStore['activeVariant']) => void;
}
```

## React Query
- All API data fetched via React Query — it handles caching, dedup, refetch
- Custom hooks per feature: `useTokenPrice(address)`, `useTrendingTokens()`
- Hook files: `src/features/{feature}/hooks/use{Name}.ts`
- Always type the return: `useQuery<TokenOverview, Error>(...)`
- Prefetch adjacent data on hover for instant navigation

## WebSocket Data Flow
1. `react-use-websocket` manages connection lifecycle
2. Incoming messages dispatched to feature-specific handlers
3. Handlers batch updates into Zustand or trigger React Query invalidation
4. Components subscribe to specific slices of state
5. Never process raw WS messages in components

## Type Definitions
- Birdeye API response types: `src/types/birdeye.ts`
- Feature-specific types colocated in feature folders
- Always use strict typing — no `any` type
- API responses: define full type, use `Pick<>` or `Omit<>` for components
- Shared types (Token, Transaction, Wallet): `src/types/common.ts`

## Data Transformation
- Raw API → display format: transform in React Query `select`
- Address formatting: `src/utils/formatAddress.ts`
- Number formatting: `src/utils/formatNumber.ts`
- Time formatting: `src/utils/formatTime.ts`
- Keep transformations pure — no side effects in transform functions
