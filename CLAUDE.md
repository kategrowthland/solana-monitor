# Solana Monitor — Claude Code Instructions

## Project Overview
Real-time Solana ecosystem intelligence dashboard inspired by worldmonitor.app. Built with React 19 + TypeScript + Vite, powered by Birdeye Data Services API.

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4 + shadcn/ui (new-york style)
- **State**: Zustand (global stores) + TanStack React Query (server state)
- **Visualization**: deck.gl + MapLibre GL (3D globe), Recharts (charts)
- **Animation**: Framer Motion
- **WebSocket**: react-use-websocket
- **Blockchain**: @solana/web3.js

## Architecture Rules

### File Organization
- Feature modules live in `src/features/{feature-name}/`
- Each feature folder contains its own components, hooks, and types
- Shared UI components go in `src/components/ui/` (shadcn) or `src/components/shared/`
- Layout components go in `src/components/layout/`
- Global stores in `src/stores/`, hooks in `src/hooks/`, types in `src/types/`

### Naming Conventions
- Components: PascalCase (`WhaleRadar.tsx`)
- Hooks: camelCase with `use` prefix (`useWhaleTransactions.ts`)
- Stores: camelCase with `Store` suffix (`whaleStore.ts`)
- Types: PascalCase with descriptive suffix (`WhaleTransaction.ts`)
- Utils: camelCase (`formatAddress.ts`)

### Component Patterns
- Use functional components with TypeScript interfaces for props
- Prefer `const Component = ({ prop }: Props) => {}` arrow function style
- Use shadcn/ui components as base — customize with Tailwind classes
- All panels use the shared `<Panel>` wrapper component for consistent styling
- Use Framer Motion for enter/exit animations on panels and data updates

### State Management
- **Zustand** for UI state, user preferences, active filters, selected variant
- **React Query** for all API data fetching — never store API data in Zustand
- **WebSocket** for real-time streams (trades, prices, alerts)
- Query keys follow pattern: `['feature', 'endpoint', params]`

### API Integration
- All Birdeye API calls go through `src/lib/api/birdeye.ts`
- Always include `x-chain: solana` header
- API key from env: `import.meta.env.VITE_BIRDEYE_API_KEY`
- Rate limit: respect 1000 req/min for Pro tier
- WebSocket connection managed in `src/lib/websocket/birdeyeSocket.ts`

### Styling Rules
- Dark theme only — use CSS custom properties from `index.css`
- Accent colors per variant: `--accent-solana` (orange), `--accent-defi` (cyan), `--accent-meme` (green), `--accent-dev` (purple)
- Panel backgrounds: `var(--bg-panel)` with `var(--panel-border)` border
- Positive values: `var(--positive)` green, Negative: `var(--negative)` red
- All text uses Inter font, monospace data uses JetBrains Mono

### Performance
- Lazy load feature modules with `React.lazy()` + Suspense
- Virtualize long lists with react-window or similar
- Debounce search inputs (300ms)
- WebSocket messages: batch state updates, don't re-render per message
- deck.gl layers: limit to 10,000 points per layer for smooth 60fps

## Key API Endpoints (Birdeye)
- Token price: `GET /defi/price?address={}`
- Token overview: `GET /defi/token_overview?address={}`
- OHLCV: `GET /defi/ohlcv?address={}&type=1H`
- Trending: `GET /defi/token_trending?sort_by=rank`
- Token trades: `GET /defi/v3/token/txs?address={}`
- Meme list: `GET /defi/v3/token/meme/list?sort_by=creation_time`
- Wallet portfolio: `GET /v1/wallet/token_list?wallet={}`
- Smart money: `GET /smart-money/v1/token/list`
- Search: `GET /defi/v3/search?keyword={}`

## Commands
- `npm run dev` — Start dev server on port 5173
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npx shadcn@latest add [component]` — Add shadcn component
