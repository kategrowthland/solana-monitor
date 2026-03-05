import { motion } from 'framer-motion';
import { AlertTriangle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SecurityAlert, AlertSeverity } from '../types/security';
import { SIGNAL_LABELS } from '../types/security';

interface AlertRowProps {
    alert: SecurityAlert;
    index: number;
}

const SEVERITY_CONFIG: Record<
    AlertSeverity,
    { icon: React.ReactNode; textClass: string; bgClass: string; borderClass: string; label: string }
> = {
    critical: {
        icon: <AlertOctagon size={12} />,
        textClass: 'text-[var(--negative)]',
        bgClass: 'bg-[var(--negative)]/10',
        borderClass: 'border-[var(--negative)]/30',
        label: 'CRITICAL',
    },
    high: {
        icon: <AlertTriangle size={12} />,
        textClass: 'text-orange-400',
        bgClass: 'bg-orange-500/10',
        borderClass: 'border-orange-500/30',
        label: 'HIGH',
    },
    medium: {
        icon: <ShieldAlert size={12} />,
        textClass: 'text-yellow-400',
        bgClass: 'bg-yellow-500/10',
        borderClass: 'border-yellow-500/30',
        label: 'MED',
    },
    info: {
        icon: <Info size={12} />,
        textClass: 'text-[var(--text-muted)]',
        bgClass: 'bg-[var(--bg-hover)]',
        borderClass: 'border-[var(--panel-border)]',
        label: 'INFO',
    },
};

const timeAgo = (ms: number): string => {
    const diffS = Math.floor((Date.now() - ms) / 1000);
    if (diffS < 60) return `${diffS}s ago`;
    const diffM = Math.floor(diffS / 60);
    if (diffM < 60) return `${diffM}m ago`;
    return `${Math.floor(diffM / 60)}h ago`;
};

export const AlertRow = ({ alert, index }: AlertRowProps) => {
    const cfg = SEVERITY_CONFIG[alert.severity];

    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18, delay: Math.min(index * 0.03, 0.4) }}
            className={cn(
                'flex items-start gap-3 px-3 py-2.5 rounded-lg border',
                'hover:bg-[var(--bg-hover)] transition-colors duration-150',
                cfg.borderClass
            )}
        >
            {/* Severity badge */}
            <div className={cn('flex items-center gap-1 mt-0.5 shrink-0 rounded px-1.5 py-0.5', cfg.bgClass)}>
                <span className={cfg.textClass}>{cfg.icon}</span>
                <span className={cn('text-[9px] font-bold tracking-wider', cfg.textClass)}>
                    {cfg.label}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    {alert.logoURI && (
                        <img
                            src={alert.logoURI}
                            alt={alert.symbol}
                            className="w-4 h-4 rounded-full shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    )}
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {alert.symbol}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] truncate">
                        · {SIGNAL_LABELS[alert.signal]}
                    </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 line-clamp-1">
                    {alert.detail}
                </p>
            </div>

            {/* Time */}
            <span className="text-[9px] text-[var(--text-muted)] shrink-0 mt-0.5 mono tabular-nums">
                {timeAgo(alert.timestamp)}
            </span>
        </motion.div>
    );
};
