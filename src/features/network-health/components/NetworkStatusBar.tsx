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
        color: 'text-gain',
        bg: 'bg-gain/10 border-gain/20',
        pulseColor: 'bg-gain',
    },
    degraded: {
        label: 'Degraded',
        color: 'text-warning',
        bg: 'bg-warning/10 border-warning/20',
        pulseColor: 'bg-warning',
    },
    congested: {
        label: 'Congested',
        color: 'text-loss',
        bg: 'bg-loss/10 border-loss/20',
        pulseColor: 'bg-loss',
    },
    unknown: {
        label: 'Loading…',
        color: 'text-muted-foreground',
        bg: 'bg-secondary border-border',
        pulseColor: 'bg-muted-foreground',
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
