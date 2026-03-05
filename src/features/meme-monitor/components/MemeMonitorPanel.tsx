import { useState, useEffect } from 'react';
import { Flame, Clock, BarChart2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel } from '@/components/shared/Panel';
import { cn } from '@/lib/utils';
import { useMemeNewList, useMemeHotList, useMemeTokens } from '../hooks/useMemeTokens';
import { MemeFeed } from './MemeFeed';
import { MemeHeatmap } from './MemeHeatmap';

// ─── Types ────────────────────────────────────────────────────────

type Tab = 'new' | 'hot' | 'map';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'new', label: 'New', icon: <Clock size={10} /> },
    { id: 'hot', label: 'Hot', icon: <Flame size={10} /> },
    { id: 'map', label: 'Map', icon: <BarChart2 size={10} /> },
];

// ─── Refresh countdown hook ───────────────────────────────────────

const REFETCH_INTERVAL = 30;

const useCountdown = (total: number, onZero?: () => void) => {
    const [remaining, setRemaining] = useState(total);

    useEffect(() => {
        const interval = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    onZero?.();
                    return total;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [total, onZero]);

    return remaining;
};

// ─── Main Panel ───────────────────────────────────────────────────

export const MemeMonitorPanel = () => {
    const [tab, setTab] = useState<Tab>('new');

    // Use base query for count badge + manual refetch trigger
    const { data: baseData, refetch, isFetching } = useMemeTokens(60);
    const { items: newItems, isLoading: newLoading } = useMemeNewList(60);
    const { items: hotItems, isLoading: hotLoading } = useMemeHotList(60);

    const countdown = useCountdown(REFETCH_INTERVAL, () => refetch());
    const totalCount = baseData?.total ?? 0;

    return (
        <Panel
            title="Meme Monitor"
            icon={<Flame size={14} />}
            className="col-span-2 row-span-2"
            collapsible
            headerAction={
                <div className="flex items-center gap-1.5">
                    {/* Token count */}
                    {totalCount > 0 && (
                        <span className="text-[10px] text-[var(--text-muted)] mono">
                            {totalCount} tokens
                        </span>
                    )}

                    {/* Refresh countdown */}
                    <button
                        onClick={() => refetch()}
                        title="Refresh now"
                        className={cn(
                            'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-[var(--text-muted)]',
                            'hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors'
                        )}
                    >
                        <RefreshCw
                            size={9}
                            className={cn(isFetching && 'animate-spin')}
                        />
                        <span className="mono tabular-nums">{countdown}s</span>
                    </button>

                    {/* Tab pills */}
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={cn(
                                'flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
                                tab === t.id
                                    ? 'bg-[var(--accent-meme)]/20 text-[var(--accent-meme)]'
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
            <AnimatePresence mode="wait">
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                >
                    {tab === 'new' && (
                        <MemeFeed
                            items={newItems}
                            isLoading={newLoading}
                            emptyMessage="No new meme tokens found"
                        />
                    )}
                    {tab === 'hot' && (
                        <MemeFeed
                            items={hotItems}
                            isLoading={hotLoading}
                            emptyMessage="No hot meme tokens found"
                        />
                    )}
                    {tab === 'map' && (
                        <MemeHeatmap
                            items={hotItems}
                            isLoading={hotLoading}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </Panel>
    );
};
