import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Panel } from '@/components/shared/Panel';
import { useTrendingTokens } from '../hooks/useTrendingTokens';
import { formatPrice, formatCompact, formatPercent } from '@/utils/formatNumber';
import { cn } from '@/lib/utils';
import { useTokenStore } from '@/stores/tokenStore';
import type { BirdeyeTrendingToken } from '@/types/birdeye';

export const TrendingTokensPanel = () => {
  const { data, isLoading, error, refetch } = useTrendingTokens(20);

  return (
    <Panel
      title="Trending Tokens"
      icon={<TrendingUp size={14} />}
      loading={isLoading}
      error={error ? 'Failed to load trending tokens' : null}
      onRetry={refetch}
      collapsible
      headerAction={
        data ? (
          <span className="text-[10px] text-[var(--text-muted)] mono">
            {data.tokens?.length ?? 0} tokens
          </span>
        ) : null
      }
    >
      {data?.tokens && data.tokens.length > 0 ? (
        <div className="flex flex-col">
          {/* Column headers */}
          <div className="grid grid-cols-[24px_minmax(0,1fr)_minmax(70px,auto)_minmax(60px,auto)_minmax(50px,auto)] gap-x-3 px-2 pb-2 border-b border-[var(--panel-border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">#</span>
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Token</span>
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider text-right">Price</span>
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider text-right">24h</span>
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider text-right">Vol</span>
          </div>

          {/* Token rows */}
          <div className="flex flex-col max-h-[520px] overflow-y-auto">
            {data.tokens.map((token, i) => (
              <TokenRow key={token.address} token={token} index={i} />
            ))}
          </div>
        </div>
      ) : (
        !isLoading && (
          <p className="text-sm text-[var(--text-muted)] text-center py-6">
            No trending tokens found
          </p>
        )
      )}
    </Panel>
  );
};

// ─── Token Row ─────────────────────────────────────────────────────

interface TokenRowProps {
  token: BirdeyeTrendingToken;
  index: number;
}

const TokenRow = ({ token, index }: TokenRowProps) => {
  const isPositive = token.price24hChangePercent >= 0;
  const selectToken = useTokenStore((s) => s.selectToken);

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      onClick={() => selectToken(token.address, token.symbol, token.logoURI)}
      className="grid grid-cols-[24px_minmax(0,1fr)_minmax(70px,auto)_minmax(60px,auto)_minmax(50px,auto)] gap-x-3 items-center px-2 py-2.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group"
    >
      {/* Rank */}
      <span className="text-xs mono text-[var(--text-muted)] tabular-nums">
        {token.rank}
      </span>

      {/* Token info */}
      <div className="flex items-center gap-2.5 min-w-0">
        {token.logoURI ? (
          <img
            src={token.logoURI}
            alt={token.symbol}
            className="w-6 h-6 rounded-full shrink-0 bg-[var(--bg-hover)]"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-6 h-6 rounded-full shrink-0 bg-[var(--bg-hover)] flex items-center justify-center">
            <span className="text-[10px] text-[var(--text-muted)] uppercase">
              {token.symbol?.slice(0, 2)}
            </span>
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-[var(--text-primary)] truncate leading-tight group-hover:text-[var(--accent-current)] transition-colors">
            {token.name}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider truncate">
            {token.symbol}
          </span>
        </div>
      </div>

      {/* Price */}
      <span className="text-xs mono text-[var(--text-primary)] text-right tabular-nums">
        {formatPrice(token.price)}
      </span>

      {/* 24h Change */}
      <span
        className={cn(
          'text-xs mono text-right tabular-nums font-medium',
          isPositive ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
        )}
      >
        {formatPercent(token.price24hChangePercent)}
      </span>

      {/* Volume */}
      <span className="text-xs mono text-[var(--text-secondary)] text-right tabular-nums">
        ${formatCompact(token.volume24hUSD)}
      </span>
    </motion.div>
  );
};
