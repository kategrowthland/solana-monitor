import { useQuery } from '@tanstack/react-query';
import { getTrendingTokens } from '@/lib/api/birdeye';
import type { BirdeyeTrendingResponse } from '@/types/birdeye';

export const useTrendingTokens = (limit: number = 20) => {
  return useQuery<BirdeyeTrendingResponse>({
    queryKey: ['birdeye', 'trending', limit],
    queryFn: () => getTrendingTokens('rank', 'asc', limit),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
};
