import { useCallback, useEffect, useRef, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useQuery } from '@tanstack/react-query';
import { getBirdeyeWsUrl } from '@/lib/websocket/birdeyeSocket';
import { getRecentTrades } from '@/lib/api/birdeye';
import type {
  BirdeyeRawTrade,
  BirdeyeRecentTradesResponse,
  NormalizedTrade,
} from '@/types/trades';
import { normalizeTrade } from '@/types/trades';

const MAX_TRADES = 50;
const BATCH_INTERVAL_MS = 500;
const REST_POLL_INTERVAL_MS = 5000;

interface UseLiveTradesReturn {
  trades: NormalizedTrade[];
  isConnected: boolean;
  connectionMode: 'websocket' | 'polling' | 'disconnected';
  tradesPerSecond: number;
}

export const useLiveTrades = (): UseLiveTradesReturn => {
  const [trades, setTrades] = useState<NormalizedTrade[]>([]);
  const [tradesPerSecond, setTradesPerSecond] = useState(0);
  const batchRef = useRef<NormalizedTrade[]>([]);
  const seenTxRef = useRef<Set<string>>(new Set());
  const tradeCountRef = useRef(0);
  const wsUrl = getBirdeyeWsUrl();

  // ─── 500ms batch flush ─────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (batchRef.current.length > 0) {
        const newBatch = [...batchRef.current];
        batchRef.current = [];

        setTrades((prev) => {
          const combined = [...newBatch, ...prev];
          return combined.slice(0, MAX_TRADES);
        });
      }
    }, BATCH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  // ─── Trades-per-second counter ─────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTradesPerSecond(tradeCountRef.current);
      tradeCountRef.current = 0;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── Add trade to batch (deduped) ─────────────────────────────
  const addTradeToBatch = useCallback((trade: NormalizedTrade) => {
    if (seenTxRef.current.has(trade.id)) return;
    seenTxRef.current.add(trade.id);
    tradeCountRef.current++;
    batchRef.current.push(trade);

    // Keep seen set bounded
    if (seenTxRef.current.size > 500) {
      const entries = Array.from(seenTxRef.current);
      seenTxRef.current = new Set(entries.slice(-250));
    }
  }, []);

  // ─── WebSocket path ────────────────────────────────────────────
  const { readyState } = useWebSocket(
    wsUrl,
    {
      onMessage: (event) => {
        try {
          const msg = JSON.parse(event.data);
          // Birdeye WS sends trade events with type "TOKEN_TRADE"
          if (msg?.data && msg?.type === 'TOKEN_TRADE') {
            const raw = msg.data as BirdeyeRawTrade;
            addTradeToBatch(normalizeTrade(raw));
          }
        } catch {
          // Ignore malformed messages
        }
      },
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: (attempt) =>
        Math.min(1000 * Math.pow(2, attempt), 30000),
      share: true,
    },
    !!wsUrl // only connect if we have a URL
  );

  const wsConnected = readyState === ReadyState.OPEN;

  // ─── REST polling fallback ─────────────────────────────────────
  const shouldPoll = !wsConnected;

  useQuery<BirdeyeRecentTradesResponse>({
    queryKey: ['birdeye', 'recent-trades'],
    queryFn: () => getRecentTrades(30),
    refetchInterval: shouldPoll ? REST_POLL_INTERVAL_MS : false,
    enabled: shouldPoll,
    select: (data) => {
      if (data?.items) {
        for (const raw of data.items) {
          addTradeToBatch(normalizeTrade(raw));
        }
      }
      return data;
    },
  });

  // ─── Connection mode ───────────────────────────────────────────
  const connectionMode = wsConnected
    ? 'websocket'
    : shouldPoll
      ? 'polling'
      : 'disconnected';

  return {
    trades,
    isConnected: wsConnected || shouldPoll,
    connectionMode,
    tradesPerSecond,
  };
};
