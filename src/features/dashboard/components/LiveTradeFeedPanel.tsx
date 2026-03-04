import { Radio, ArrowUpRight, ArrowDownRight, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel } from '@/components/shared/Panel';
import { useLiveTrades } from '../hooks/useLiveTrades';
import { formatCompact } from '@/utils/formatNumber';
import { truncateAddress } from '@/utils/formatAddress';
import { timeAgo } from '@/utils/formatTime';
import { cn } from '@/lib/utils';
import type { NormalizedTrade } from '@/types/trades';

export const LiveTradeFeedPanel = () => {
  const { trades, isConnected, connectionMode, tradesPerSecond } =
    useLiveTrades();

  return (
    <Panel
      title="Live Feed"
      icon={<Radio size={14} />}
      collapsible
      headerAction={
        <div className="flex items-center gap-2">
          {tradesPerSecond > 0 && (
            <span className="text-[10px] mono text-[var(--text-muted)]">
              {tradesPerSecond}/s
            </span>
          )}
          <ConnectionBadge mode={connectionMode} isConnected={isConnected} />
        </div>
      }
    >
      {trades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--text-muted)] border-t-[var(--accent-current)] animate-spin" />
          <p className="text-xs text-[var(--text-muted)]">
            Waiting for trades...
          </p>
        </div>
      ) : (
        <div className="flex flex-col max-h-[520px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {trades.map((trade) => (
              <TradeRow key={trade.id} trade={trade} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </Panel>
  );
};

// ─── Connection Badge ──────────────────────────────────────────────

interface ConnectionBadgeProps {
  mode: 'websocket' | 'polling' | 'disconnected';
  isConnected: boolean;
}

const ConnectionBadge = ({ mode, isConnected }: ConnectionBadgeProps) => (
  <div
    className={cn(
      'flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-medium',
      isConnected
        ? 'text-[var(--positive)] bg-[var(--positive)]/10'
        : 'text-[var(--negative)] bg-[var(--negative)]/10'
    )}
  >
    {isConnected ? <Wifi size={8} /> : <WifiOff size={8} />}
    {mode === 'websocket' ? 'WS' : mode === 'polling' ? 'POLL' : 'OFF'}
  </div>
);

// ─── Trade Row ─────────────────────────────────────────────────────

interface TradeRowProps {
  trade: NormalizedTrade;
}

const TradeRow = ({ trade }: TradeRowProps) => {
  const isBuy = trade.direction === 'buy';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group"
    >
      {/* Direction icon */}
      <div
        className={cn(
          'w-6 h-6 rounded-md flex items-center justify-center shrink-0',
          isBuy
            ? 'bg-[var(--positive)]/15 text-[var(--positive)]'
            : 'bg-[var(--negative)]/15 text-[var(--negative)]'
        )}
      >
        {isBuy ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      </div>

      {/* Token pair + source */}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent-current)] transition-colors">
            {trade.baseSymbol}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">/</span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {trade.quoteSymbol}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] mono text-[var(--text-muted)] truncate">
            {truncateAddress(trade.owner)}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] opacity-40">
            ·
          </span>
          <span className="text-[10px] text-[var(--text-muted)] truncate">
            {formatSource(trade.source)}
          </span>
        </div>
      </div>

      {/* Amount + time */}
      <div className="flex flex-col items-end shrink-0">
        <span
          className={cn(
            'text-xs mono font-medium tabular-nums',
            isBuy ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
          )}
        >
          {isBuy ? '+' : '-'}${formatCompact(trade.volumeUsd)}
        </span>
        <span className="text-[10px] text-[var(--text-muted)] mono tabular-nums">
          {timeAgo(trade.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

// ─── Source formatter ──────────────────────────────────────────────

const SOURCE_MAP: Record<string, string> = {
  raydium: 'Raydium',
  raydium_clamm: 'Raydium',
  raydium_cp: 'Raydium CP',
  orca: 'Orca',
  pump_dot_fun: 'Pump.fun',
  pump_amm: 'Pump AMM',
  meteora_dlmm: 'Meteora',
  lifinity: 'Lifinity',
  phoenix: 'Phoenix',
};

const formatSource = (source: string): string =>
  SOURCE_MAP[source] ?? source.replace(/_/g, ' ');
