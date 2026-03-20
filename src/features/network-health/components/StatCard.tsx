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
    green: 'bg-gain/15 text-gain',
    yellow: 'bg-warning/15 text-warning',
    red: 'bg-loss/15 text-loss',
    cyan: 'bg-[hsl(195,100%,50%)]/15 text-[hsl(195,100%,60%)]',
    muted: 'bg-secondary text-muted-foreground',
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
            'flex flex-col gap-1 px-3 py-2.5 rounded-xl border border-border bg-secondary/50',
            className
        )}
    >
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {label}
        </span>
        <div className="flex items-end gap-2">
            <span
                className={cn(
                    'text-xl font-bold text-foreground leading-none',
                    mono && 'font-mono tabular-nums'
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
            <span className="text-[10px] text-muted-foreground leading-none">
                {sub}
            </span>
        )}
    </div>
);
