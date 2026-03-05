import { useQuery } from '@tanstack/react-query';
import { getTrendingTokens, getTopGainers, getTopLosers } from '@/lib/api/birdeye';
import type { GainerLoser, TrendingToken } from '../types/defi';

const REFETCH_INTERVAL_MS = 30_000;

// ─── Normalizers ─────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normGainer = (raw: any): GainerLoser => ({
    address: raw.address ?? '',
    name: raw.name ?? raw.symbol ?? '',
    symbol: raw.symbol ?? '???',
    logoURI: raw.logoURI ?? raw.logo_uri,
    price: raw.price ?? 0,
    pnl: raw.pnl ?? raw.PnL ?? 0,
    priceChangePercent: raw.price_change_24h_percent ?? raw.priceChangePercent ?? 0,
    volume24h: raw.volume_24h_usd ?? raw.volume24h ?? 0,
    marketcap: raw.market_cap ?? raw.marketcap ?? 0,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normTrending = (raw: any, i: number): TrendingToken => ({
    address: raw.address ?? '',
    name: raw.name ?? raw.symbol ?? '',
    symbol: raw.symbol ?? '???',
    logoURI: raw.logoURI ?? raw.logo_uri,
    price: raw.price ?? 0,
    priceChangePercent: raw.price_change_24h_percent ?? 0,
    volume24h: raw.volume_24h_usd ?? 0,
    liquidity: raw.liquidity ?? 0,
    rank: raw.rank ?? i + 1,
});

// ─── Hook ─────────────────────────────────────────────────────────

export const useDefiPulse = () => {
    const gainersQ = useQuery({
        queryKey: ['defi', 'gainers'],
        queryFn: async () => {
            const raw = await getTopGainers('today', 10);
            const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];
            return items.map(normGainer) as GainerLoser[];
        },
        refetchInterval: REFETCH_INTERVAL_MS,
        staleTime: 15_000,
    });

    const losersQ = useQuery({
        queryKey: ['defi', 'losers'],
        queryFn: async () => {
            const raw = await getTopLosers('today', 10);
            const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];
            return items.map(normGainer) as GainerLoser[];
        },
        refetchInterval: REFETCH_INTERVAL_MS,
        staleTime: 15_000,
    });

    const trendingQ = useQuery({
        queryKey: ['defi', 'trending'],
        queryFn: async () => {
            const raw = await getTrendingTokens('rank', 'asc', 20);
            const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];
            return items.map(normTrending) as TrendingToken[];
        },
        refetchInterval: REFETCH_INTERVAL_MS,
        staleTime: 15_000,
    });

    const totalTrendingVolume = (trendingQ.data ?? []).reduce(
        (acc, t) => acc + t.volume24h,
        0
    );

    return {
        gainers: gainersQ.data ?? [],
        losers: losersQ.data ?? [],
        trending: trendingQ.data ?? [],
        totalTrendingVolume,
        isLoading: gainersQ.isLoading || losersQ.isLoading || trendingQ.isLoading,
        isError: gainersQ.isError || losersQ.isError || trendingQ.isError,
        refetch: () => {
            gainersQ.refetch();
            losersQ.refetch();
            trendingQ.refetch();
        },
    };
};
