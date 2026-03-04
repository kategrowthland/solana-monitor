// ─── Raw Birdeye Trade (from REST + WS) ────────────────────────────

export interface BirdeyeTradeToken {
  symbol: string;
  address: string;
  decimals: number;
  price: number;
  amount: string;
  ui_amount: number;
  ui_change_amount: number;
  type_swap: 'from' | 'to';
}

export interface BirdeyeRawTrade {
  base: BirdeyeTradeToken;
  quote: BirdeyeTradeToken;
  tx_type: string;
  tx_hash: string;
  block_unix_time: number;
  block_number: number;
  volume_usd: number;
  owner: string;
  source: string;
  pool_id: string;
}

export interface BirdeyeRecentTradesResponse {
  items: BirdeyeRawTrade[];
  has_next: boolean;
}

// ─── Normalized Trade (for display) ────────────────────────────────

export interface NormalizedTrade {
  id: string;
  txHash: string;
  timestamp: number;
  baseSymbol: string;
  quoteSymbol: string;
  baseAddress: string;
  volumeUsd: number;
  direction: 'buy' | 'sell';
  owner: string;
  source: string;
}

// ─── Helpers ───────────────────────────────────────────────────────

export const normalizeTrade = (raw: BirdeyeRawTrade): NormalizedTrade => {
  // Determine direction: if SOL/USDC is in "from" (quote.type_swap === "from"),
  // the user is selling SOL to buy the base token → it's a "buy" of the base token.
  // If SOL is "to", user sold base token for SOL → "sell".
  const solAddress = 'So11111111111111111111111111111111111111112';
  const isSolBase = raw.base.address === solAddress;
  const direction: 'buy' | 'sell' = isSolBase
    ? raw.base.type_swap === 'to' ? 'sell' : 'buy'
    : raw.base.type_swap === 'to' ? 'buy' : 'sell';

  // The "interesting" token is the non-SOL one
  const baseToken = isSolBase ? raw.quote : raw.base;
  const quoteToken = isSolBase ? raw.base : raw.quote;

  return {
    id: `${raw.tx_hash}-${raw.block_number}`,
    txHash: raw.tx_hash,
    timestamp: raw.block_unix_time,
    baseSymbol: baseToken.symbol,
    quoteSymbol: quoteToken.symbol,
    baseAddress: baseToken.address,
    volumeUsd: raw.volume_usd,
    direction,
    owner: raw.owner,
    source: raw.source,
  };
};
