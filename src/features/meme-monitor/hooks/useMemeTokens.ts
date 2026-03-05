import { useQuery } from '@tanstack/react-query';
import { getMemeTokens } from '@/lib/api/birdeye';
import type { BirdeyeMemeToken } from '@/types/birdeye';

const REFETCH_INTERVAL_MS = 30_000;

type MemeListData = { items: BirdeyeMemeToken[]; total: number };

// Normalize whatever shape the API returns into { items, total }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalize = (raw: any): MemeListData => {
    // Shape 1: { items: [...], total: n }
    if (Array.isArray(raw?.items)) {
        return { items: raw.items, total: raw.total ?? raw.items.length };
    }
    // Shape 2: direct array
    if (Array.isArray(raw)) {
        return { items: raw, total: raw.length };
    }
    return { items: [], total: 0 };
};

export const useMemeTokens = (limit: number = 60) => {
    return useQuery<MemeListData>({
        queryKey: ['meme', 'list', limit],
        queryFn: async () => {
            const raw = await getMemeTokens('creation_time', 'desc', limit);
            return normalize(raw);
        },
        refetchInterval: REFETCH_INTERVAL_MS,
        staleTime: 15_000,
    });
};

/** Pre-sorted by creation_time desc (newest first) */
export const useMemeNewList = (limit = 60) => {
    const query = useMemeTokens(limit);
    const items = [...(query.data?.items ?? [])].sort(
        (a, b) => (b.creation_time ?? 0) - (a.creation_time ?? 0)
    );
    return { ...query, items };
};

/** Pre-sorted by volume_24h_usd desc (hottest first) */
export const useMemeHotList = (limit = 60) => {
    const query = useMemeTokens(limit);
    const items = [...(query.data?.items ?? [])].sort(
        (a, b) => (b.volume_24h_usd ?? 0) - (a.volume_24h_usd ?? 0)
    );
    return { ...query, items };
};
