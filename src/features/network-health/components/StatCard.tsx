import { cn } from '@/lib/utils';

interface StatCardProps {
    label: string;
    value: string | number;
    sub?: string;
    badge?: string;
    badgeColor?: 'green' | 'yellow' | 'red' | 'cyan' | 'muted';
    mono?: boolean;
    className?: string;
}

const BADGE_COLORS: Record<NonNullable<StatCardProps['badgeColor']>, string> = {
    green: 'bg-[var(--positive)]/15 text-[var(--positive)]',
    yellow: 'bg-[var(--warning)]/15 text-[var(--warning)]',
    red: 'bg-[var(--negative)]/15 text-[var(--negative)]',
    cyan: 'bg-[var(--accent-defi)]/15 text-[var(--accent-defi)]',
    muted: 'bg-[var(--bg-hover)] text-[var(--text-muted)]',
};

export const StatCard = ({
    label,
    value,
    sub,
    badge,
    badgeColor = 'muted',
    mono = true,
    className,
}: StatCardProps) => (
    <div
        className={cn(
            'flex flex-col gap-1 px-3 py-2.5 rounded-xl border border-[var(--panel-border)] bg-[var(--bg-hover)]/50',
            className
        )}
    >
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            {label}
        </span>
        <div className="flex items-end gap-2">
            <span
                className={cn(
                    'text-xl font-bold text-[var(--text-primary)] leading-none',
                    mono && 'mono tabular-nums'
                )}
            >
                {value}
            </span>
            {badge && (
                <span
                    className={cn(
                        'text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none mb-0.5',
                        BADGE_COLORS[badgeColor]
                    )}
                >
                    {badge}
                </span>
            )}
        </div>
        {sub && (
            <span className="text-[10px] text-[var(--text-muted)] leading-none">
                {sub}
            </span>
        )}
    </div>
);
