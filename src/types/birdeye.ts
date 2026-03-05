// ─── Trending Tokens ───────────────────────────────────────────────

export interface BirdeyeTrendingToken {
  address: string;
  decimals: number;
  fdv: number;
  liquidity: number;
  logoURI: string;
  marketcap: number;
  name: string;
  price: number;
  rank: number;
  symbol: string;
  volume24hUSD: number;
  volume24hChangePercent: number;
  price24hChangePercent: number;
}

export interface BirdeyeTrendingResponse {
  updateUnixTime: number;
  updateTime: string;
  tokens: BirdeyeTrendingToken[];
  total: number;
}

// ─── Token Overview (full) ─────────────────────────────────────────

export interface BirdeyeTokenOverview {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  price: number;
  priceChange1hPercent: number;
  priceChange4hPercent: number;
  priceChange24hPercent: number;
  v1hUSD: number;
  v4hUSD: number;
  v24hUSD: number;
  vHistory24hUSD: number;
  liquidity: number;
  marketCap: number;
  fdv: number;
  totalSupply: number;
  circulatingSupply: number;
  holder: number;
  trade24h: number;
  buy24h: number;
  sell24h: number;
  uniqueWallet24h: number;
  extensions?: {
    description?: string;
    twitter?: string;
    website?: string;
    discord?: string;
    coingeckoId?: string;
  };
}

// ─── Token Security ────────────────────────────────────────────────

export interface BirdeyeTokenSecurity {
  creatorAddress: string;
  creationTime: number;
  creatorPercentage: number;
  top10HolderPercent: number;
  top10UserPercent: number;
  mutableMetadata: boolean;
  freezeable: boolean | null;
  freezeAuthority: string | null;
  transferFeeEnable: boolean | null;
  isToken2022: boolean;
  jupStrictList: boolean;
  totalSupply: number;
  lockInfo: unknown;
}

// ─── Search ────────────────────────────────────────────────────────

export interface BirdeyeSearchResult {
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  liquidity: number;
  price: number;
  volume24hUSD: number;
  fdv: number;
  marketcap: number;
  price24hChangePercent: number;
}

export interface BirdeyeSearchResponse {
  items: BirdeyeSearchResult[];
  total: number;
}

// ─── OHLCV ─────────────────────────────────────────────────────────

export interface BirdeyeOHLCVItem {
  unixTime: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface BirdeyeOHLCVResponse {
  items: BirdeyeOHLCVItem[];
}

// ─── Price ─────────────────────────────────────────────────────────

export interface BirdeyePriceResponse {
  value: number;
  updateUnixTime: number;
  updateHumanTime: string;
}

// ─── Token Holder ──────────────────────────────────────────────────

export interface BirdeyeTokenHolder {
  amount: string;
  decimals: number;
  mint: string;
  owner: string;
  token_account: string;
  ui_amount: number;
}

export interface BirdeyeTokenHolderResponse {
  items: BirdeyeTokenHolder[];
}

// ─── V3 Token Trade ───────────────────────────────────────────────

export interface BirdeyeV3TokenTrade {
  tx_type: string;
  tx_hash: string;
  block_unix_time: number;
  volume_usd: number;
  volume: number;
  owner: string;
  source: string;
  side: 'buy' | 'sell';
  from: {
    symbol: string;
    address: string;
    decimals: number;
    price: number;
    ui_amount: number;
  };
  to: {
    symbol: string;
    address: string;
    decimals: number;
    price: number;
    ui_amount: number;
  };
  pool_id: string;
}

export interface BirdeyeV3TokenTradeResponse {
  items: BirdeyeV3TokenTrade[];
}

// ─── Smart Money ──────────────────────────────────────────────────

export interface BirdeyeSmartMoneyToken {
  address: string;
  symbol: string;
  name: string;
  logo_uri: string;
  price: number;
  price_change_24h: number;
  net_flow: number;
  smart_traders_no: number;
  smart_buy_no: number;
  smart_sell_no: number;
  market_cap: number;
}

export interface BirdeyeSmartMoneyResponse {
  items: BirdeyeSmartMoneyToken[];
}

// ─── Gainers / Losers ─────────────────────────────────────────────

export interface BirdeyeGainerLoser {
  address: string;
  pnl: number;
  trade_count: number;
  token_traded: number;
}

export interface BirdeyeGainerLoserResponse {
  items: BirdeyeGainerLoser[];
}

// ─── Meme Tokens ──────────────────────────────────────────────────

export interface BirdeyeMemeToken {
  address: string;
  symbol: string;
  name: string;
  logo_uri: string;
  price: number;
  price_change_24h_percent: number;
  volume_24h_usd: number;
  liquidity: number;
  market_cap: number;
  fdv: number;
  creation_time: number; // unix seconds
  total_supply: number;
  decimals: number;
  extensions?: {
    twitter?: string;
    website?: string;
    description?: string;
  };
}

export interface BirdeyeMemeListResponse {
  items: BirdeyeMemeToken[];
  total: number;
}
