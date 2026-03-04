import { useQuery } from '@tanstack/react-query';
import { searchTokens } from '@/lib/api/birdeye';
import { useDebounce } from './useDebounce';
import type { BirdeyeSearchResponse } from '@/types/birdeye';

export const useTokenSearch = (query: string) => {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery<BirdeyeSearchResponse>({
    queryKey: ['birdeye', 'search', debouncedQuery],
    queryFn: () => searchTokens(debouncedQuery, 8),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60_000,
  });
};
