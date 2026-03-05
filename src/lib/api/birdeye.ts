import axios from 'axios';

const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';

const birdeyeClient = axios.create({
  baseURL: BIRDEYE_BASE_URL,
  headers: {
    'X-API-KEY': import.meta.env.VITE_BIRDEYE_API_KEY || '',
    'x-chain': 'solana',
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
birdeyeClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      console.warn('[Birdeye] Rate limited — back off');
    } else if (error.response?.status === 401) {
      console.error('[Birdeye] Unauthorized — check API key');
    }
    return Promise.reject(error);
  }
);

// ─── Token Endpoints ───────────────────────────────────────────────

export const getTokenPrice = async (address: string) => {
  const { data } = await birdeyeClient.get('/defi/price', {
    params: { address },
  });
  return data.data;
};

export const getTokenOverview = async (address: string) => {
  const { data } = await birdeyeClient.get('/defi/token_overview', {
    params: { address },
  });
  return data.data;
};

export const getMultiPrice = async (addresses: string[]) => {
  const { data } = await birdeyeClient.get('/defi/multi_price', {
    params: { list_address: addresses.join(',') },
  });
  return data.data;
};

// ─── Trending ──────────────────────────────────────────────────────

export const getTrendingTokens = async (
  sortBy: string = 'rank',
  sortType: string = 'asc',
  limit: number = 20
) => {
  const { data } = await birdeyeClient.get('/defi/token_trending', {
    params: { sort_by: sortBy, sort_type: sortType, offset: 0, limit },
  });
  return data.data;
};

// ─── OHLCV ─────────────────────────────────────────────────────────

export const getOHLCV = async (
  address: string,
  type: string = '1H',
  timeFrom: number,
  timeTo: number
) => {
  const { data } = await birdeyeClient.get('/defi/ohlcv', {
    params: { address, type, time_from: timeFrom, time_to: timeTo },
  });
  return data.data;
};

// ─── Search ────────────────────────────────────────────────────────

interface RawSearchItem {
  type: string;
  result: Array<{
    name: string;
    symbol: string;
    address: string;
    logo_uri: string;
    liquidity: number;
    price: number;
    volume_24h_usd: number;
    fdv: number;
    market_cap: number;
    price_change_24h_percent: number;
  }>;
}

export const searchTokens = async (keyword: string, limit: number = 10) => {
  const { data } = await birdeyeClient.get('/defi/v3/search', {
    params: {
      keyword,
      chain: 'solana',
      target: 'token',
      sort_by: 'volume_24h_usd',
      sort_type: 'desc',
      limit,
    },
  });

  // v3 search returns nested { items: [{ type, result: [...] }] }
  // Flatten and normalize to our BirdeyeSearchResult shape
  const rawItems: RawSearchItem[] = data.data?.items ?? [];
  const items = rawItems.flatMap((group) =>
    (group.result ?? []).map((r) => ({
      address: r.address,
      symbol: r.symbol,
      name: r.name,
      logoURI: r.logo_uri,
      liquidity: r.liquidity,
      price: r.price,
      volume24hUSD: r.volume_24h_usd,
      fdv: r.fdv,
      marketcap: r.market_cap,
      price24hChangePercent: r.price_change_24h_percent,
    }))
  );

  return { items, total: items.length };
};

// ─── Token List ────────────────────────────────────────────────────

export const getTokenList = async (
  sortBy: string = 'v24hUSD',
  sortType: string = 'desc',
  limit: number = 20
) => {
  const { data } = await birdeyeClient.get('/defi/tokenlist', {
    params: { sort_by: sortBy, sort_type: sortType, offset: 0, limit },
  });
  return data.data;
};

// ─── Meme Tokens ───────────────────────────────────────────────────

export const getMemeTokens = async (
  sortBy: string = 'creation_time',
  sortType: string = 'desc',
  limit: number = 20
) => {
  const { data } = await birdeyeClient.get('/defi/v3/token/meme/list', {
    params: { sort_by: sortBy, sort_type: sortType, limit },
  });
  return data.data;
};

// ─── Recent Trades ─────────────────────────────────────────────

export const getRecentTrades = async (limit: number = 50) => {
  const { data } = await birdeyeClient.get('/defi/v3/txs/recent', {
    params: { tx_type: 'swap', limit },
  });
  return data.data;
};

// ─── Token Security ────────────────────────────────────────────────

export const getTokenSecurity = async (address: string) => {
  const { data } = await birdeyeClient.get('/defi/token_security', {
    params: { address },
  });
  return data.data;
};

// ─── Token Holders ─────────────────────────────────────────────────

export const getTokenHolders = async (address: string, limit: number = 10) => {
  const { data } = await birdeyeClient.get('/defi/v3/token/holder', {
    params: { address, limit },
  });
  return data.data;
};

// ─── Token Trades ──────────────────────────────────────────────────

export const getTokenTrades = async (address: string, limit: number = 20) => {
  const { data } = await birdeyeClient.get('/defi/v3/token/txs', {
    params: { address, tx_type: 'swap', sort_type: 'desc', limit },
  });
  return data.data;
};

// ─── Smart Money ───────────────────────────────────────────────────

export const getSmartMoneyTokens = async (
  interval: string = '1d',
  limit: number = 20
) => {
  const { data } = await birdeyeClient.get('/smart-money/v1/token/list', {
    params: { interval, limit },
  });
  return data.data;
};

// ─── Whale Trades (top volume recent trades) ─────────────────────

export const getWhaleTrades = async (limit: number = 500) => {
  const { data } = await birdeyeClient.get('/defi/v3/txs/recent', {
    params: { tx_type: 'swap', limit },
  });
  // Sort by volume desc and take the top 30 — these are the biggest recent swaps
  const items = (data.data?.items ?? [])
    .sort(
      (a: { volume_usd: number }, b: { volume_usd: number }) =>
        b.volume_usd - a.volume_usd
    )
    .slice(0, 30);
  return { items };
};

// ─── Top Gainers / Losers (by token price change) ──────────────────

export const getTopGainers = async (limit: number = 10) => {
  const { data } = await birdeyeClient.get('/defi/v3/token/list', {
    params: {
      sort_by: 'price_change_24h_percent',
      sort_type: 'desc',
      min_liquidity: 50000,
      limit,
    },
  });
  return data.data;
};

export const getTopLosers = async (limit: number = 10) => {
  const { data } = await birdeyeClient.get('/defi/v3/token/list', {
    params: {
      sort_by: 'price_change_24h_percent',
      sort_type: 'asc',
      min_liquidity: 50000,
      limit,
    },
  });
  return data.data;
};

export default birdeyeClient;
