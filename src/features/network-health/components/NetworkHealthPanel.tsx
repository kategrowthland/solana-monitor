import { useState } from 'react';
import { Zap, Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel } from '@/components/shared/Panel';
import { cn } from '@/lib/utils';
import { useTPS } from '../hooks/useTPS';
import { useEpochInfo } from '../hooks/useEpochInfo';
import { useValidators } from '../hooks/useValidators';
import { NetworkStatusBar } from './NetworkStatusBar';
import { TpsChart } from './TpsChart';
import { EpochRing } from './EpochRing';
import { StatCard } from './StatCard';
import { ValidatorList } from './ValidatorList';

// ─── Types ────────────────────────────────────────────────────────

type Tab = 'overview' | 'validators';

const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'validators', label: 'Validators' },
];

// ─── Main Panel ───────────────────────────────────────────────────

export const NetworkHealthPanel = () => {
    const [tab, setTab] = useState<Tab>('overview');
    const tps = useTPS();
    const epoch = useEpochInfo();
    const validators = useValidators();

    const statusBadgeColor =
        tps.status === 'healthy'
            ? 'green'
            : tps.status === 'degraded'
                ? 'yellow'
                : tps.status === 'congested'
                    ? 'red'
                    : 'muted';

    const isRefetching = tps.isLoading || epoch.isLoading;

    return (
        <Panel
            title="Network Health"
            icon={<Zap size={14} />}
            collapsible
            headerAction={
                <div className="flex items-center gap-1.5">
                    {/* Live epoch indicator */}
                    {epoch.epoch > 0 && (
                        <span className="text-[10px] text-[var(--text-muted)] mono tabular-nums">
                            Epoch {epoch.epoch}
                        </span>
                    )}

                    {/* Refresh spinner */}
                    <button
                        onClick={() => { tps.refetch(); epoch.refetch(); validators.refetch(); }}
                        className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={10} className={cn(isRefetching && 'animate-spin')} />
                    </button>

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
                    {tab === 'overview' && (
                        <OverviewTab tps={tps} epoch={epoch} validators={validators} statusBadgeColor={statusBadgeColor} />
                    )}
                    {tab === 'validators' && (
                        <ValidatorList
                            validators={validators.topValidators}
                            totalStake={validators.totalStake}
                            nakamotoCoeff={validators.nakamotoCoeff}
                            isLoading={validators.isLoading}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </Panel>
    );
};

// ─── Overview Tab ─────────────────────────────────────────────────

interface OverviewTabProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tps: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    epoch: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validators: any;
    statusBadgeColor: string;
}

const OverviewTab = ({ tps, epoch, validators, statusBadgeColor }: OverviewTabProps) => (
    <div className="flex flex-col gap-4">
        {/* Status bar */}
        <NetworkStatusBar
            status={tps.status}
            currentTps={tps.currentTps}
            isLoading={tps.isLoading}
        />

        {/* Stat cards grid — 2×2 */}
        <div className="grid grid-cols-2 gap-2">
            <StatCard
                label="Current TPS"
                value={tps.isLoading ? '—' : tps.currentTps.toLocaleString()}
                sub={`avg ${tps.avgTps.toLocaleString()} · peak ${tps.peakTps.toLocaleString()}`}
                badge={tps.status === 'unknown' ? undefined : tps.status}
                badgeColor={statusBadgeColor as 'green' | 'yellow' | 'red' | 'muted'}
            />
            <StatCard
                label="Current Slot"
                value={epoch.isLoading ? '—' : epoch.absoluteSlot.toLocaleString()}
                sub={`Block height ${epoch.blockHeight > 0 ? epoch.blockHeight.toLocaleString() : '—'}`}
            />
            <StatCard
                label="Validators"
                value={validators.isLoading ? '—' : validators.totalActive.toLocaleString()}
                sub={
                    validators.totalDelinquent > 0
                        ? `${validators.totalDelinquent} delinquent`
                        : 'All active'
                }
                badge={validators.totalDelinquent > 0 ? `${validators.totalDelinquent} down` : undefined}
                badgeColor={validators.totalDelinquent > 0 ? 'red' : 'green'}
            />
            <StatCard
                label="Nakamoto Coeff"
                value={validators.isLoading ? '—' : validators.nakamotoCoeff}
                sub="validators to control 33% stake"
                badge={
                    validators.nakamotoCoeff > 0
                        ? validators.nakamotoCoeff <= 10
                            ? 'low'
                            : validators.nakamotoCoeff <= 30
                                ? 'moderate'
                                : 'high'
                        : undefined
                }
                badgeColor={
                    validators.nakamotoCoeff <= 10
                        ? 'red'
                        : validators.nakamotoCoeff <= 30
                            ? 'yellow'
                            : 'green'
                }
            />
        </div>

        {/* TPS Chart + Epoch Ring side by side */}
        <div className="flex gap-4 items-start">
            {/* TPS Chart — takes most width */}
            <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                    <Zap size={10} className="text-[var(--accent-current)]" />
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                        TPS History (last ~10 min)
                    </span>
                </div>
                <TpsChart samples={tps.samples} peakTps={tps.peakTps} />
            </div>

            {/* Epoch Ring — fixed width */}
            <div className="flex flex-col gap-1 items-center">
                <div className="flex items-center gap-1.5">
                    <Shield size={10} className="text-[var(--accent-current)]" />
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                        Epoch
                    </span>
                </div>
                <EpochRing
                    epoch={epoch.epoch}
                    progress={epoch.progress}
                    slotsRemaining={epoch.slotsRemaining}
                    estimatedSecondsLeft={epoch.estimatedSecondsLeft}
                    isLoading={epoch.isLoading}
                />
            </div>
        </div>
    </div>
);
