# API Integration Rules

## Birdeye REST API
- Base URL: `https://public-api.birdeye.so`
- Auth header: `X-API-KEY: {key}` on every request
- Chain header: `x-chain: solana` on every request
- All API calls must go through the centralized client in `src/lib/api/birdeye.ts`
- Never hardcode API keys — always use `import.meta.env.VITE_BIRDEYE_API_KEY`
- Wrap all endpoints with React Query hooks in feature-specific hook files

## React Query Conventions
- Query key pattern: `['birdeye', endpoint, ...params]`
- Default staleTime: 30 seconds for price data, 5 minutes for metadata
- Default refetchInterval: 30s for live dashboards, none for static pages
- Always define return types with TypeScript interfaces
- Use `select` to transform API responses into component-ready shapes
- Implement error boundaries per panel, not per page

## Birdeye WebSocket
- URL: `wss://public-api.birdeye.so/socket`
- Auth: send `x-api-key` in connection params
- Subscribe format: `{ type: "SUBSCRIBE", data: { channel, params } }`
- Channels: `TOKEN_PRICE`, `TOKEN_TRADE`, `TOKEN_NEW_LISTING`
- Reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s)
- Use react-use-websocket for connection management
- Batch incoming messages — update state max once per 500ms

## Helius RPC
- Use for on-chain reads: validator info, epoch data, recent blockhash
- Base URL from `VITE_HELIUS_RPC_URL` env var
- Use @solana/web3.js Connection class
- Cache validator list for 5 minutes (data changes slowly)

## Rate Limiting
- Birdeye Pro: 1000 requests/min
- Implement request queue in `src/lib/api/rateLimiter.ts`
- Show degraded UI state when rate limited, never crash
- WebSocket: max 10 subscriptions per connection

## Error Handling
- Network errors: show inline error state in panel, retry button
- 429 rate limit: queue and retry with backoff
- 401 unauthorized: show API key configuration prompt
- Never show raw error messages to users — map to friendly strings
