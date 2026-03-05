// ─── DeFi Pulse Types ─────────────────────────────────────────────

export interface GainerLoser {
    address: string;
    name: string;
    symbol: string;
    logoURI?: string;
    price: number;
    /** PnL in USD — raw value from Birdeye */
    pnl: number;
    /** Price change percent over the interval */
    priceChangePercent: number;
    volume24h: number;
    marketcap: number;
}

export interface TrendingToken {
    address: string;
    name: string;
    symbol: string;
    logoURI?: string;
    price: number;
    priceChangePercent: number;
    volume24h: number;
    liquidity: number;
    rank: number;
}

export interface DefiPulseData {
    gainers: GainerLoser[];
    losers: GainerLoser[];
    trending: TrendingToken[];
    totalTrendingVolume: number;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
}
