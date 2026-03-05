import { useQuery } from '@tanstack/react-query';
import {
  getWhaleTrades,
  getSmartMoneyTokens,
  getTopGainers,
  getTopLosers,
} from '@/lib/api/birdeye';

// ─── Whale Feed (polls every 10s) ────────────────────────────────────

export const useWhaleFeed = (enabled: boolean = true) =>
  useQuery({
    queryKey: ['whale-feed'],
    queryFn: () => getWhaleTrades(500),
    refetchInterval: enabled ? 10_000 : false,
    staleTime: 8_000,
  });

// ─── Smart Money Consensus ────────────────────────────────────────────

export const useSmartMoney = (interval: string = '1d') =>
  useQuery({
    queryKey: ['smart-money', interval],
    queryFn: () => getSmartMoneyTokens(interval, 20),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

// ─── Top Gainers & Losers ─────────────────────────────────────────────

export const useTopGainers = () =>
  useQuery({
    queryKey: ['top-gainers'],
    queryFn: () => getTopGainers('today', 5),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

export const useTopLosers = () =>
  useQuery({
    queryKey: ['top-losers'],
    queryFn: () => getTopLosers('today', 5),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
