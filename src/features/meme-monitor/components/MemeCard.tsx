import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, formatCompact, formatPercent } from '@/utils/formatNumber';
import { useTokenStore } from '@/stores/tokenStore';
import { SparkLine } from './SparkLine';
import { useMemeSparkline } from '../hooks/useMemeSparkline';
import type { BirdeyeMemeToken } from '@/types/birdeye';

// ─── Age badge ───────────────────────────────────────────────────

const getAgeBadge = (creationTime: number) => {
    const ageMs = Date.now() - creationTime * 1000;
    const ageH = ageMs / 3_600_000;

    if (ageH < 1) {
        const ageMin = Math.max(1, Math.floor(ageMs / 60_000));
        return {
            label: `${ageMin}m`,
            cls: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
        };
    }
    if (ageH < 24) {
        return {
            label: `${Math.floor(ageH)}h`,
            cls: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        };
    }
    const ageDays = Math.floor(ageH / 24);
    return {
        label: `${ageDays}d`,
        cls: 'bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--panel-border)]',
    };
};

// ─── Component ───────────────────────────────────────────────────

interface MemeCardProps {
    token: BirdeyeMemeToken;
    index: number;
}

export const MemeCard = ({ token, index }: MemeCardProps) => {
    const selectToken = useTokenStore((s) => s.selectToken);
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    // Lazy-enable sparkline fetch only when card enters the viewport
    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === 'undefined') {
            setVisible(true); // fallback: load immediately if API unavailable
            return;
        }
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const { data: sparkPoints = [] } = useMemeSparkline(token.address, visible);

    const isPositive = (token.price_change_24h_percent ?? 0) >= 0;
    const age = getAgeBadge(token.creation_time ?? 0);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(index * 0.015, 0.4) }}
            onClick={() =>
                selectToken(token.address, token.symbol ?? '???', token.logo_uri)
            }
            className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
                'hover:bg-[var(--bg-hover)] transition-colors duration-150'
            )}
        >
            {/* Logo */}
            <div className="relative shrink-0">
                {token.logo_uri ? (
                    <img
                        src={token.logo_uri}
                        alt={token.symbol}
                        className="w-9 h-9 rounded-full bg-[var(--bg-hover)]"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-[var(--bg-hover)] flex items-center justify-center">
                        <span className="text-xs font-bold text-[var(--text-muted)] uppercase">
                            {(token.symbol ?? '??').slice(0, 2)}
                        </span>
                    </div>
                )}
                {/* Age badge */}
                <span
                    className={cn(
                        'absolute -bottom-1 -right-1 text-[9px] font-bold px-1 rounded leading-tight',
                        age.cls
                    )}
                >
                    {age.label}
                </span>
            </div>

            {/* Token info */}
            <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-meme)] transition-colors">
                        {token.symbol ?? '???'}
                    </span>
                    <ExternalLink
                        size={9}
                        className="text-[var(--text-muted)] opacity-0 group-hover:opacity-60 transition-opacity shrink-0"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[80px]">
                        {token.name}
                    </span>
                    {token.volume_24h_usd > 0 && (
                        <>
                            <span className="text-[10px] text-[var(--text-muted)] opacity-40">·</span>
                            <span className="text-[10px] mono text-[var(--text-muted)]">
                                vol ${formatCompact(token.volume_24h_usd)}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Sparkline (only if we have enough data) */}
            {sparkPoints.length >= 2 && (
                <SparkLine points={sparkPoints} width={60} height={22} className="shrink-0" />
            )}

            {/* Price + change */}
            <div className="flex flex-col items-end shrink-0">
                <span className="text-xs mono text-[var(--text-primary)] tabular-nums">
                    {token.price > 0 ? formatPrice(token.price) : '—'}
                </span>
                <span
                    className={cn(
                        'text-[10px] mono font-semibold tabular-nums',
                        isPositive ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
                    )}
                >
                    {formatPercent(token.price_change_24h_percent ?? 0)}
                </span>
            </div>
        </motion.div>
    );
};
