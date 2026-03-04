/**
 * Birdeye WebSocket configuration.
 *
 * Primary:  WebSocket at wss://public-api.birdeye.so/socket/solana
 * Fallback: REST polling via /defi/v3/txs/recent every 5 seconds
 *
 * The useLiveTrades hook handles both paths transparently.
 */

const BIRDEYE_WS_BASE = 'wss://public-api.birdeye.so/socket/solana';

export const getBirdeyeWsUrl = (): string | null => {
  const apiKey = import.meta.env.VITE_BIRDEYE_API_KEY;
  if (!apiKey) return null;
  return `${BIRDEYE_WS_BASE}?x-api-key=${apiKey}`;
};

// ─── Subscribe / Unsubscribe message builders ──────────────────────

export const buildSubscribeMessage = (
  channel: string,
  params: Record<string, unknown> = {}
) =>
  JSON.stringify({
    type: 'SUBSCRIBE',
    data: { type: channel, ...params },
  });

export const buildUnsubscribeMessage = (
  channel: string,
  params: Record<string, unknown> = {}
) =>
  JSON.stringify({
    type: 'UNSUBSCRIBE',
    data: { type: channel, ...params },
  });

// Channel names
export const WS_CHANNELS = {
  TOKEN_TRADE: 'TOKEN_TRADE',
  TOKEN_PRICE: 'TOKEN_PRICE',
  TOKEN_NEW_LISTING: 'TOKEN_NEW_LISTING',
} as const;
