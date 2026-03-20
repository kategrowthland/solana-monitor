import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatPrice, formatCompact, formatPercent } from '@/utils/formatNumber';
import { useTokenStore } from '@/stores/tokenStore';
import type { GainerLoser } from '../types/defi';

interface GainerLoserRowProps {
    item: GainerLoser;
    index: number;
    mode: 'gainer' | 'loser';
}

export const GainerLoserRow = ({ item, index, mode }: GainerLoserRowProps) => {
    const isPositive = mode === 'gainer';
    const pctValue = item.priceChangePercent !== 0
        ? item.priceChangePercent
        : isPositive ? Math.abs(item.pnl) : -Math.abs(item.pnl);
    const selectToken = useTokenStore((s) => s.selectToken);

    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18, delay: Math.min(index * 0.04, 0.4) }}
            onClick={() => selectToken(item.address, item.symbol, item.logoURI)}
            className={cn(
                'group flex items-center gap-3 px-3 py-2 rounded-lg',
                'hover:bg-[var(--bg-hover)] transition-colors duration-150 cursor-pointer'
            )}
        >
            {/* Rank */}
            <span className="text-[10px] text-[var(--text-muted)] mono w-4 shrink-0 tabular-nums">
                {index + 1}
            </span>

            {/* Logo */}
            <div className="shrink-0">
                {item.logoURI ? (
                    <img
                        src={item.logoURI}
                        alt={item.symbol}
                        className="w-7 h-7 rounded-full bg-[var(--bg-hover)]"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--bg-hover)] flex items-center justify-center">
                        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase">
                            {(item.symbol).slice(0, 2)}
                        </span>
                    </div>
                )}
            </div>

            {/* Name */}
            <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-current)] transition-colors">
                    {item.symbol}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] truncate">
                    vol ${formatCompact(item.volume24h)}
                </span>
            </div>

            {/* Price + Change */}
            <div className="flex flex-col items-end shrink-0">
                <span className="text-xs mono text-[var(--text-primary)] tabular-nums">
                    {item.price > 0 ? formatPrice(item.price) : '—'}
                </span>
                <span
                    className={cn(
                        'text-[10px] font-bold mono tabular-nums px-1.5 py-0.5 rounded',
                        isPositive
                            ? 'bg-[var(--positive)]/15 text-[var(--positive)]'
                            : 'bg-[var(--negative)]/15 text-[var(--negative)]'
                    )}
                >
                    {formatPercent(pctValue)}
                </span>
            </div>
        </motion.div>
    );
};
