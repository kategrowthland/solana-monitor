import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatPercent, formatCompact } from '@/utils/formatNumber';
import { useTokenStore } from '@/stores/tokenStore';
import type { BirdeyeMemeToken } from '@/types/birdeye';

// ─── Color scale: red → neutral → green ───────────────────────────

const getPctColor = (pct: number): string => {
    // Clamp to ±30% and map to a color
    const clamped = Math.max(-30, Math.min(30, pct));
    const norm = clamped / 30; // -1 to 1

    if (norm >= 0) {
        // 0 → neutral, 1 → vivid green
        const g = Math.round(80 + norm * 175);
        const rb = Math.round(30 - norm * 30);
        return `rgb(${rb}, ${g}, ${rb})`;
    } else {
        // 0 → neutral, -1 → vivid red
        const r = Math.round(80 + Math.abs(norm) * 175);
        const gb = Math.round(30 - Math.abs(norm) * 30);
        return `rgb(${r}, ${gb}, ${gb})`;
    }
};

// Cell size: proportional to market_cap, clamped 52–140px

const getCellSize = (mcap: number, maxMcap: number): number => {
    const MIN = 52;
    const MAX = 140;
    if (maxMcap <= 0) return 80;
    const ratio = Math.sqrt(mcap / maxMcap); // sqrt for less extreme size differences
    return Math.round(MIN + ratio * (MAX - MIN));
};

// ─── Component ───────────────────────────────────────────────────

interface MemeHeatmapProps {
    items: BirdeyeMemeToken[];
    isLoading?: boolean;
}

export const MemeHeatmap = ({ items, isLoading }: MemeHeatmapProps) => {
    const selectToken = useTokenStore((s) => s.selectToken);

    const maxMcap = useMemo(
        () => Math.max(...items.map((t) => t.market_cap ?? 0), 0),
        [items]
    );

    if (isLoading && items.length === 0) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--text-muted)] border-t-[var(--accent-meme)] animate-spin" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-xs text-[var(--text-muted)]">No data available</p>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-1.5 p-2 max-h-[480px] overflow-y-auto content-start">
            {items.map((token, i) => {
                const size = getCellSize(token.market_cap ?? 0, maxMcap);
                const bgColor = getPctColor(token.price_change_24h_percent ?? 0);
                const isPositive = (token.price_change_24h_percent ?? 0) >= 0;

                return (
                    <motion.div
                        key={token.address}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: Math.min(i * 0.01, 0.3) }}
                        onClick={() => selectToken(token.address, token.symbol, token.logo_uri)}
                        title={`${token.name}\nPrice: $${token.price?.toFixed(8)}\n24h: ${formatPercent(token.price_change_24h_percent)}\nVol: $${formatCompact(token.volume_24h_usd)}\nMcap: $${formatCompact(token.market_cap)}`}
                        className="relative rounded-lg cursor-pointer overflow-hidden shrink-0 flex flex-col items-center justify-center group transition-all duration-150 hover:ring-1 hover:ring-white/30 hover:brightness-110"
                        style={{ width: size, height: size, backgroundColor: bgColor }}
                    >
                        {/* Logo (small) */}
                        {token.logo_uri && size >= 70 && (
                            <img
                                src={token.logo_uri}
                                alt={token.symbol}
                                className="w-5 h-5 rounded-full opacity-80 mb-0.5"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        )}

                        {/* Symbol */}
                        <span
                            className={cn(
                                'font-bold uppercase leading-none text-center px-1 truncate w-full text-center',
                                size >= 80 ? 'text-[11px]' : 'text-[9px]'
                            )}
                            style={{ color: 'rgba(255,255,255,0.92)' }}
                        >
                            {token.symbol}
                        </span>

                        {/* Percent */}
                        <span
                            className={cn(
                                'font-semibold leading-none mono mt-0.5',
                                size >= 80 ? 'text-[10px]' : 'text-[8px]',
                                isPositive ? 'text-white/90' : 'text-white/80'
                            )}
                        >
                            {formatPercent(token.price_change_24h_percent)}
                        </span>

                        {/* Hover overlay with extra info */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5 p-1">
                            <span className="text-[9px] font-bold text-white/95 truncate w-full text-center">
                                {token.symbol}
                            </span>
                            <span className="text-[8px] text-white/70 mono">
                                vol ${formatCompact(token.volume_24h_usd)}
                            </span>
                            <span className="text-[8px] text-white/70 mono leading-none">
                                mcap ${formatCompact(token.market_cap)}
                            </span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
