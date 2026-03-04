import { useQuery } from '@tanstack/react-query';
import {
  getTokenOverview,
  getTokenSecurity,
  getTokenHolders,
  getTokenTrades,
  getOHLCV,
} from '@/lib/api/birdeye';
import type {
  BirdeyeTokenOverview,
  BirdeyeTokenSecurity,
  BirdeyeTokenHolderResponse,
  BirdeyeOHLCVResponse,
  BirdeyeV3TokenTradeResponse,
} from '@/types/birdeye';

export const useTokenOverview = (address: string | null) =>
  useQuery<BirdeyeTokenOverview>({
    queryKey: ['birdeye', 'overview', address],
    queryFn: () => getTokenOverview(address!),
    enabled: !!address,
    staleTime: 30_000,
  });

export const useTokenSecurity = (address: string | null) =>
  useQuery<BirdeyeTokenSecurity>({
    queryKey: ['birdeye', 'security', address],
    queryFn: () => getTokenSecurity(address!),
    enabled: !!address,
    staleTime: 5 * 60_000,
  });

export const useTokenHolders = (address: string | null) =>
  useQuery<BirdeyeTokenHolderResponse>({
    queryKey: ['birdeye', 'holders', address],
    queryFn: () => getTokenHolders(address!, 10),
    enabled: !!address,
    staleTime: 60_000,
  });

export const useTokenTrades = (address: string | null) =>
  useQuery<BirdeyeV3TokenTradeResponse>({
    queryKey: ['birdeye', 'token-trades', address],
    queryFn: () => getTokenTrades(address!, 15),
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 15_000,
  });

export const useTokenChart = (address: string | null, timeframe: string = '1H') => {
  const now = Math.floor(Date.now() / 1000);
  const rangeMap: Record<string, number> = {
    '1H': 3600,
    '4H': 4 * 3600,
    '1D': 24 * 3600,
    '1W': 7 * 24 * 3600,
    '1M': 30 * 24 * 3600,
  };
  const range = rangeMap[timeframe] ?? 24 * 3600;

  return useQuery<BirdeyeOHLCVResponse>({
    queryKey: ['birdeye', 'ohlcv', address, timeframe],
    queryFn: () => getOHLCV(address!, timeframe === '1M' ? '1D' : timeframe === '1W' ? '4H' : '15m', now - range, now),
    enabled: !!address,
    staleTime: 30_000,
  });
};
