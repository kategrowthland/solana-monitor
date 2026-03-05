import { useQuery } from '@tanstack/react-query';
import { getOHLCV } from '@/lib/api/birdeye';
import type { BirdeyeOHLCVItem } from '@/types/birdeye';

interface OHLCVResponse {
    items: BirdeyeOHLCVItem[];
}

/**
 * Fetches 24-hour OHLCV data for a token to power a sparkline chart.
 * Only enabled when `enabled` is true (intersection-observer gate).
 */
export const useMemeSparkline = (address: string, enabled: boolean = true) => {
    const now = Math.floor(Date.now() / 1000);
    const dayAgo = now - 86_400;

    return useQuery<number[]>({
        queryKey: ['meme', 'sparkline', address],
        queryFn: async () => {
            const data: OHLCVResponse = await getOHLCV(address, '1H', dayAgo, now);
            return (data?.items ?? []).map((item: BirdeyeOHLCVItem) => item.c);
        },
        enabled: !!address && enabled,
        staleTime: 5 * 60 * 1000, // 5 min — sparklines don't need to be real-time
        gcTime: 10 * 60 * 1000,
    });
};
