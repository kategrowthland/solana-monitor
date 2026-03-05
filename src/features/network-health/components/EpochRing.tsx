import { useId } from 'react';
import { cn } from '@/lib/utils';

interface EpochRingProps {
    epoch: number;
    progress: number;         // 0-100
    slotsRemaining: number;
    estimatedSecondsLeft: number;
    isLoading?: boolean;
}

const formatTimeLeft = (seconds: number): string => {
    if (seconds <= 0) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `~${h}h ${m}m`;
    return `~${m}m`;
};

const formatCompactNum = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
};

export const EpochRing = ({
    epoch,
    progress,
    slotsRemaining,
    estimatedSecondsLeft,
    isLoading,
}: EpochRingProps) => {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
    const gradId = `epochGrad${uid}`;

    const SIZE = 120;
    const STROKE = 10;
    const R = (SIZE - STROKE) / 2;
    const CIRC = 2 * Math.PI * R;
    const clampedPct = Math.min(100, Math.max(0, progress));
    const dashOffset = CIRC * (1 - clampedPct / 100);

    // Color based on progress
    const arcColor =
        clampedPct >= 95 ? '#FF4444' : clampedPct >= 80 ? '#FFAA00' : '#F7931A';

    return (
        <div className="flex flex-col items-center gap-2">
            {/* SVG Ring */}
            <div className="relative">
                <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
                    {/* Track */}
                    <circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={R}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={STROKE}
                    />
                    {/* Progress arc */}
                    {!isLoading && (
                        <circle
                            cx={SIZE / 2}
                            cy={SIZE / 2}
                            r={R}
                            fill="none"
                            stroke={arcColor}
                            strokeWidth={STROKE}
                            strokeLinecap="round"
                            strokeDasharray={CIRC}
                            strokeDashoffset={dashOffset}
                            style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
                        />
                    )}
                    <defs>
                        <linearGradient id={gradId} x1="1" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={arcColor} stopOpacity={1} />
                            <stop offset="100%" stopColor={arcColor} stopOpacity={0.6} />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center label */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ transform: 'rotate(0deg)' }}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 rounded-full border-2 border-[var(--text-muted)] border-t-[var(--accent-current)] animate-spin" />
                    ) : (
                        <>
                            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider leading-none">
                                Epoch
                            </span>
                            <span className="text-2xl font-bold text-[var(--text-primary)] mono leading-tight tabular-nums">
                                {epoch}
                            </span>
                            <span
                                className={cn(
                                    'text-[11px] font-semibold mono leading-none',
                                    clampedPct >= 95
                                        ? 'text-[var(--negative)]'
                                        : clampedPct >= 80
                                            ? 'text-[var(--warning)]'
                                            : 'text-[var(--text-secondary)]'
                                )}
                            >
                                {clampedPct.toFixed(1)}%
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Meta — slots remaining + ETA */}
            {!isLoading && (
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] text-[var(--text-muted)]">
                        <span className="text-[var(--text-secondary)] mono">{formatCompactNum(slotsRemaining)}</span> slots left
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                        {formatTimeLeft(estimatedSecondsLeft)} to next epoch
                    </span>
                </div>
            )}
        </div>
    );
};
