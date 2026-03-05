import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel } from '@/components/shared/Panel';
import { cn } from '@/lib/utils';
import { formatCompact } from '@/utils/formatNumber';
import { useDefiPulse } from '../hooks/useDefiPulse';
import { GainerLoserRow } from './GainerLoserRow';

type Tab = 'gainers' | 'losers';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'gainers', label: 'Gainers', icon: <TrendingUp size={11} /> },
    { id: 'losers', label: 'Losers', icon: <TrendingDown size={11} /> },
];

// ─── Skeleton ─────────────────────────────────────────────────────

const Skeleton = () => (
    <div className="flex flex-col gap-1 px-3 py-2">
        {Array.from({ length: 8 }).map((_, i) => (
            <div
                key={i}
                className="flex items-center gap-3 py-1.5"
                style={{ opacity: 1 - i * 0.08 }}
            >
                <div className="w-4 h-3 rounded bg-[var(--bg-hover)] animate-pulse" />
                <div className="w-7 h-7 rounded-full bg-[var(--bg-hover)] animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-1">
                    <div className="h-3 w-16 rounded bg-[var(--bg-hover)] animate-pulse" />
                    <div className="h-2 w-12 rounded bg-[var(--bg-hover)] animate-pulse" />
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="h-3 w-14 rounded bg-[var(--bg-hover)] animate-pulse" />
                    <div className="h-3 w-10 rounded bg-[var(--bg-hover)] animate-pulse" />
                </div>
            </div>
        ))}
    </div>
);

// ─── Volume Bar ────────────────────────────────────────────────────

interface VolumeBarProps {
    totalVolume: number;
    tokenCount: number;
}

const VolumeBar = ({ totalVolume, tokenCount }: VolumeBarProps) => (
    <div className="flex items-center gap-3 px-3 py-2 border-b border-[var(--panel-border)] bg-[var(--bg-hover)]/40 rounded-lg">
        <BarChart2 size={12} className="text-[var(--accent-defi)] shrink-0" />
        <div className="flex items-baseline gap-1 flex-1">
            <span className="text-[10px] text-[var(--text-muted)]">24h Volume (top {tokenCount}):</span>
            <span className="text-xs font-bold mono text-[var(--text-secondary)] tabular-nums">
                ${formatCompact(totalVolume)}
            </span>
        </div>
        <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-defi)] animate-pulse" />
            <span className="text-[9px] text-[var(--accent-defi)] font-semibold tracking-wider uppercase">Live</span>
        </div>
    </div>
);

// ─── Main Panel ───────────────────────────────────────────────────

export const DefiPulsePanel = () => {
    const [tab, setTab] = useState<Tab>('gainers');
    const { gainers, losers, trending, totalTrendingVolume, isLoading, refetch } = useDefiPulse();

    const items = tab === 'gainers' ? gainers : losers;

    return (
        <Panel
            title="DeFi Pulse"
            icon={<BarChart2 size={14} />}
            collapsible
            className="col-span-2"
            headerAction={
                <div className="flex items-center gap-1.5">
                    {/* Refresh */}
                    <button
                        onClick={refetch}
                        className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={10} className={cn(isLoading && 'animate-spin')} />
                    </button>

                    {/* Tab pills */}
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={cn(
                                'flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
                                tab === t.id
                                    ? 'bg-[var(--accent-defi)]/20 text-[var(--accent-defi)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                            )}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    ))}
                </div>
            }
        >
            <div className="flex flex-col gap-2">
                {/* Volume summary bar */}
                {!isLoading && trending.length > 0 && (
                    <VolumeBar totalVolume={totalTrendingVolume} tokenCount={trending.length} />
                )}

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                    >
                        {isLoading && items.length === 0 ? (
                            <Skeleton />
                        ) : items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <BarChart2 size={24} className="text-[var(--text-muted)] opacity-20" />
                                <p className="text-xs text-[var(--text-muted)]">No data available</p>
                            </div>
                        ) : (
                            <div className="flex flex-col overflow-y-auto max-h-[380px]">
                                {items.map((item, i) => (
                                    <GainerLoserRow
                                        key={item.address || i}
                                        item={item}
                                        index={i}
                                        mode={tab === 'gainers' ? 'gainer' : 'loser'}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </Panel>
    );
};
