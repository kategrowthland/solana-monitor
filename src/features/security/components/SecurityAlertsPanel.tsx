import { useState } from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel } from '@/components/shared/Panel';
import { cn } from '@/lib/utils';
import { useSecurityAlerts } from '../hooks/useSecurityAlerts';
import { AlertRow } from './AlertRow';
import type { AlertSeverity } from '../types/security';

type Filter = 'all' | AlertSeverity;

const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'critical', label: 'Critical' },
    { id: 'high', label: 'High' },
    { id: 'medium', label: 'Med' },
];

// ─── Loading state ─────────────────────────────────────────────────

const ScanningState = () => (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="relative w-10 h-10">
            <Shield size={40} className="text-[var(--text-muted)] opacity-20" />
            <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-[var(--accent-current)] animate-spin" />
        </div>
        <p className="text-xs text-[var(--text-muted)]">Scanning trending tokens…</p>
        <p className="text-[10px] text-[var(--text-muted)] opacity-60">
            Checking security data for top 20 tokens
        </p>
    </div>
);

// ─── Empty state ───────────────────────────────────────────────────

const CleanState = () => (
    <div className="flex flex-col items-center justify-center py-10 gap-2">
        <Shield size={32} className="text-[var(--positive)] opacity-40" />
        <p className="text-xs text-[var(--text-secondary)] font-semibold">No risks detected</p>
        <p className="text-[10px] text-[var(--text-muted)]">Top trending tokens look clean</p>
    </div>
);

// ─── Main Panel ────────────────────────────────────────────────────

export const SecurityAlertsPanel = () => {
    const [filter, setFilter] = useState<Filter>('all');
    const { data: alerts = [], isLoading, isFetching, refetch } = useSecurityAlerts();

    const filtered =
        filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter);

    const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
    const highCount = alerts.filter((a) => a.severity === 'high').length;

    // Badge count for header
    const badgeCount = criticalCount + highCount;

    return (
        <Panel
            title="Security Alerts"
            icon={<Shield size={14} />}
            collapsible
            className="col-span-2"
            headerAction={
                <div className="flex items-center gap-1.5">
                    {/* Alert count badge */}
                    {badgeCount > 0 && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--negative)]/15 text-[var(--negative)] text-[9px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--negative)] animate-pulse" />
                            {badgeCount} alert{badgeCount > 1 ? 's' : ''}
                        </span>
                    )}

                    {/* Refresh */}
                    <button
                        onClick={() => refetch()}
                        className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
                        title="Re-scan"
                    >
                        <RefreshCw size={10} className={cn(isFetching && 'animate-spin')} />
                    </button>

                    {/* Filters */}
                    {FILTERS.map((f) => {
                        const count =
                            f.id === 'all'
                                ? alerts.length
                                : alerts.filter((a) => a.severity === f.id).length;
                        return (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={cn(
                                    'px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
                                    filter === f.id
                                        ? 'bg-[var(--accent-current)]/20 text-[var(--accent-current)]'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                                )}
                            >
                                {f.label}
                                {count > 0 && (
                                    <span className="ml-1 text-[9px] opacity-60">({count})</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            }
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={filter}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                >
                    {isLoading ? (
                        <ScanningState />
                    ) : filtered.length === 0 ? (
                        <CleanState />
                    ) : (
                        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[380px] pr-0.5">
                            {filtered.map((alert, i) => (
                                <AlertRow key={alert.id} alert={alert} index={i} />
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </Panel>
    );
};
