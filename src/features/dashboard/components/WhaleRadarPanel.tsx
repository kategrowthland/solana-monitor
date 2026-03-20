import { useState, useMemo } from 'react';
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel } from '@/components/shared/Panel';
import {
  useWhaleFeed,
  useTopGainers,
  useTopLosers,
} from '../hooks/useWhaleRadar';
import { formatCompact } from '@/utils/formatNumber';
import { truncateAddress } from '@/utils/formatAddress';
import { timeAgo } from '@/utils/formatTime';
import { cn } from '@/lib/utils';
import { useTokenStore } from '@/stores/tokenStore';

type Tab = 'whales' | 'gainers';

// ─── V3 Recent Trade shape (base/quote with type_swap) ──────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawRecentTrade = any;

interface NormalizedTrade {
  tx_hash: string;
  block_unix_time: number;
  volume_usd: number;
  owner: string;
  source: string;
  isBuy: boolean;
  token: { symbol: string; address: string };
}

const SOL_ADDRESS = 'So11111111111111111111111111111111111111112';

/** Normalize a v3/txs/recent trade into a display-friendly shape */
const normalizeTrade = (raw: RawRecentTrade): NormalizedTrade => {
  const base = raw.base ?? {};
  const quote = raw.quote ?? {};

  // Figure out which side is the "interesting" non-SOL token
  const baseIsSOL = base.address === SOL_ADDRESS;
  const interestingToken = baseIsSOL ? quote : base;

  // If the interesting token's type_swap is "to", user received it → BUY
  const isBuy = interestingToken.type_swap === 'to';

  return {
    tx_hash: raw.tx_hash ?? '',
    block_unix_time: raw.block_unix_time ?? 0,
    volume_usd: raw.volume_usd ?? 0,
    owner: raw.owner ?? '',
    source: raw.source ?? '',
    isBuy,
    token: {
      symbol: interestingToken.symbol ?? '???',
      address: interestingToken.address ?? '',
    },
  };
};

const TABS: { id: Tab; label: string }[] = [
  { id: 'whales', label: 'Whale Feed' },
  { id: 'gainers', label: 'Gainers/Losers' },
];

// ─── Whale Volume Tier ────────────────────────────────────────────
const getVolumeTier = (usd: number) => {
  if (usd >= 10_000) return { className: 'text-[var(--critical)] animate-pulse' };
  if (usd >= 1_000) return { className: 'text-[var(--warning)]' };
  if (usd >= 100) return { className: 'text-yellow-400/80' };
  return { className: 'text-[var(--text-primary)]' };
};

// ─── Source formatter ─────────────────────────────────────────────
const SOURCE_MAP: Record<string, string> = {
  raydium: 'Raydium', raydium_clamm: 'Raydium', raydium_cp: 'Raydium CP',
  orca: 'Orca', pump_dot_fun: 'Pump.fun', pump_amm: 'Pump AMM',
  meteora_dlmm: 'Meteora', meteora_damm_v2: 'Meteora', lifinity: 'Lifinity', phoenix: 'Phoenix',
};
const formatSource = (source: string): string =>
  SOURCE_MAP[source] ?? source.replace(/_/g, ' ');

// ═══════════════════════════════════════════════════════════════════
// MAIN PANEL
// ═══════════════════════════════════════════════════════════════════

export const WhaleRadarPanel = () => {
  const [tab, setTab] = useState<Tab>('whales');
  const [paused, setPaused] = useState(false);

  return (
    <Panel
      title="Whale Radar"
      icon={<Activity size={14} />}
      className="col-span-2 row-span-2"
      collapsible
      headerAction={
        <div className="flex items-center gap-1">
          {/* Tab pills */}
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
                tab === t.id
                  ? 'bg-[var(--accent-current)]/20 text-[var(--accent-current)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              {t.label}
            </button>
          ))}
          {/* Pause toggle (whale tab only) */}
          {tab === 'whales' && (
            <button
              onClick={() => setPaused((p) => !p)}
              className="ml-1 p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
              title={paused ? 'Resume' : 'Pause'}
            >
              {paused ? <Play size={10} /> : <Pause size={10} />}
            </button>
          )}
        </div>
      }
    >
      {tab === 'whales' && <WhaleFeedTab paused={paused} />}
      {tab === 'gainers' && <GainersLosersTab />}
    </Panel>
  );
};

// ═══════════════════════════════════════════════════════════════════
// TAB A — WHALE FEED
// ═══════════════════════════════════════════════════════════════════

const WhaleFeedTab = ({ paused }: { paused: boolean }) => {
  const { data, isLoading } = useWhaleFeed(!paused);

  const trades: NormalizedTrade[] = useMemo(() => {
    const rawItems: RawRecentTrade[] = data?.items ?? [];
    // Normalize, dedupe by tx_hash, sort by volume desc
    const seen = new Set<string>();
    return rawItems
      .map(normalizeTrade)
      .sort((a, b) => b.volume_usd - a.volume_usd)
      .filter((t) => {
        if (seen.has(t.tx_hash)) return false;
        seen.add(t.tx_hash);
        return true;
      })
      .slice(0, 30);
  }, [data]);

  if (isLoading && trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--text-muted)] border-t-[var(--accent-current)] animate-spin" />
        <p className="text-xs text-[var(--text-muted)]">Scanning whale activity...</p>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <Activity size={20} className="text-[var(--text-muted)] opacity-40" />
        <p className="text-xs text-[var(--text-muted)]">No whale trades found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[520px] overflow-y-auto">
      {/* Summary bar */}
      <div className="flex items-center gap-3 px-2 py-1.5 mb-1 border-b border-[var(--border-subtle)]">
        <span className="text-[10px] text-[var(--text-muted)]">
          {trades.length} whale txs
        </span>
        <span className="text-[10px] text-[var(--text-muted)]">
          Total: <span className="text-[var(--text-primary)] mono">${formatCompact(trades.reduce((s, t) => s + t.volume_usd, 0))}</span>
        </span>
        {paused && (
          <span className="text-[10px] text-[var(--warning)] font-medium ml-auto">PAUSED</span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {trades.map((trade, i) => (
          <WhaleTradeRow key={`${trade.tx_hash}-${i}`} trade={trade} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// ─── Whale Trade Row ──────────────────────────────────────────────

const WhaleTradeRow = ({ trade }: { trade: NormalizedTrade }) => {
  const { isBuy, token } = trade;
  const tier = getVolumeTier(trade.volume_usd);
  const selectToken = useTokenStore((s) => s.selectToken);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={() => selectToken(token.address, token.symbol)}
      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group"
    >
      {/* Direction icon */}
      <div
        className={cn(
          'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
          isBuy
            ? 'bg-[var(--positive)]/15 text-[var(--positive)]'
            : 'bg-[var(--negative)]/15 text-[var(--negative)]'
        )}
      >
        {isBuy ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      </div>

      {/* Token + wallet + source */}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={cn('text-[10px] font-semibold uppercase', isBuy ? 'text-[var(--positive)]' : 'text-[var(--negative)]')}>
            {isBuy ? 'BUY' : 'SELL'}
          </span>
          <span className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent-current)] transition-colors">
            {token.symbol || '???'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] mono text-[var(--text-muted)] truncate">
            {truncateAddress(trade.owner)}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] opacity-40">·</span>
          <span className="text-[10px] text-[var(--text-muted)] truncate">
            {formatSource(trade.source)}
          </span>
        </div>
      </div>

      {/* Amount + tier + time */}
      <div className="flex flex-col items-end shrink-0">
        <span className={cn('text-xs mono font-semibold tabular-nums', tier.className)}>
          ${formatCompact(trade.volume_usd)}
        </span>
        <span className="text-[10px] text-[var(--text-muted)] mono tabular-nums">
          {timeAgo(trade.block_unix_time)}
        </span>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// TAB C — TOP GAINERS & LOSERS
// ═══════════════════════════════════════════════════════════════════

const GainersLosersTab = () => {
  const { data: gainersData, isLoading: gLoading } = useTopGainers();
  const { data: losersData, isLoading: lLoading } = useTopLosers();

  const gainers = gainersData?.items ?? [];
  const losers = losersData?.items ?? [];
  const isLoading = gLoading || lLoading;

  if (isLoading && gainers.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--text-muted)] border-t-[var(--accent-current)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-1 max-h-[520px] overflow-y-auto">
      {/* Gainers */}
      <div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-[var(--border-subtle)]">
          <TrendingUp size={10} className="text-[var(--positive)]" />
          <span className="text-[10px] font-semibold text-[var(--positive)] uppercase tracking-wider">
            Top Gainers
          </span>
        </div>
        {gainers.length === 0 ? (
          <p className="text-[10px] text-[var(--text-muted)] px-2 py-4 text-center">No data</p>
        ) : (
          gainers.map((g: GainerRow, i: number) => (
            <div
              key={`g-${i}`}
              className="flex items-center justify-between px-2 py-2 hover:bg-[var(--bg-hover)] rounded-md transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] text-[var(--text-muted)] w-4 text-right">{i + 1}</span>
                <span className="text-xs mono text-[var(--text-primary)] truncate">
                  {truncateAddress(g.address)}
                </span>
              </div>
              <span className="text-xs mono font-medium text-[var(--positive)]">
                +${formatCompact(g.pnl)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Losers */}
      <div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-[var(--border-subtle)]">
          <TrendingDown size={10} className="text-[var(--negative)]" />
          <span className="text-[10px] font-semibold text-[var(--negative)] uppercase tracking-wider">
            Top Losers
          </span>
        </div>
        {losers.length === 0 ? (
          <p className="text-[10px] text-[var(--text-muted)] px-2 py-4 text-center">No data</p>
        ) : (
          losers.map((l: GainerRow, i: number) => (
            <div
              key={`l-${i}`}
              className="flex items-center justify-between px-2 py-2 hover:bg-[var(--bg-hover)] rounded-md transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] text-[var(--text-muted)] w-4 text-right">{i + 1}</span>
                <span className="text-xs mono text-[var(--text-primary)] truncate">
                  {truncateAddress(l.address)}
                </span>
              </div>
              <span className="text-xs mono font-medium text-[var(--negative)]">
                -${formatCompact(Math.abs(l.pnl))}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GainerRow = any;
