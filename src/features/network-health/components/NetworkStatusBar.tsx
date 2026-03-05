import { cn } from '@/lib/utils';
import type { NetworkStatus } from '../hooks/useTPS';

interface NetworkStatusBarProps {
    status: NetworkStatus;
    currentTps: number;
    isLoading?: boolean;
}

const STATUS_CONFIG: Record<
    NetworkStatus,
    { label: string; color: string; bg: string; pulseColor: string }
> = {
    healthy: {
        label: 'Healthy',
        color: 'text-[var(--positive)]',
        bg: 'bg-[var(--positive)]/10 border-[var(--positive)]/20',
        pulseColor: 'bg-[var(--positive)]',
    },
    degraded: {
        label: 'Degraded',
        color: 'text-[var(--warning)]',
        bg: 'bg-[var(--warning)]/10 border-[var(--warning)]/20',
        pulseColor: 'bg-[var(--warning)]',
    },
    congested: {
        label: 'Congested',
        color: 'text-[var(--negative)]',
        bg: 'bg-[var(--negative)]/10 border-[var(--negative)]/20',
        pulseColor: 'bg-[var(--negative)]',
    },
    unknown: {
        label: 'Loading…',
        color: 'text-[var(--text-muted)]',
        bg: 'bg-[var(--bg-hover)] border-[var(--panel-border)]',
        pulseColor: 'bg-[var(--text-muted)]',
    },
};

export const NetworkStatusBar = ({
    status,
    currentTps,
    isLoading,
}: NetworkStatusBarProps) => {
    const cfg = STATUS_CONFIG[isLoading ? 'unknown' : status];

    return (
        <div
            className={cn(
                'flex items-center justify-between px-3 py-2 rounded-xl border',
                cfg.bg
            )}
        >
            {/* Left: live dot + label */}
            <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span
                        className={cn(
                            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-60',
                            cfg.pulseColor
                        )}
                    />
                    <span
                        className={cn(
                            'relative inline-flex rounded-full h-2 w-2',
                            cfg.pulseColor
                        )}
                    />
                </span>
                <span
                    className={cn(
                        'text-xs font-semibold uppercase tracking-wider',
                        cfg.color
                    )}
                >
                    {cfg.label}
                </span>
            </div>

            {/* Right: current TPS */}
            {currentTps > 0 && !isLoading && (
                <div className="flex items-baseline gap-1">
                    <span className={cn('text-sm mono font-bold tabular-nums', cfg.color)}>
                        {currentTps.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">TPS</span>
                </div>
            )}
        </div>
    );
};
