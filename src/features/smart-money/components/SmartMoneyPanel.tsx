import { useState } from 'react';
import { Brain, TrendingUp, TrendingDown } from 'lucide-react';
import { Panel } from '@/components/shared/Panel';
import { useSmartMoney } from '@/features/dashboard/hooks/useWhaleRadar';
import { formatCompact } from '@/utils/formatNumber';
import { cn } from '@/lib/utils';
import { useTokenStore } from '@/stores/tokenStore';

const INTERVALS = ['1d', '7d', '30d'] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SmartMoneyRow = any;

export const SmartMoneyPanel = () => {
  const [interval, setInterval] = useState<string>('1d');
  const { data, isLoading } = useSmartMoney(interval);
  const selectToken = useTokenStore((s) => s.selectToken);

  const tokens = Array.isArray(data) ? data : (data?.items ?? []);

  return (
    <Panel
      title="Smart Money"
      icon={<Brain size={14} />}
      collapsible
      className="col-span-2"
      headerAction={
        <div className="flex items-center gap-1">
          {INTERVALS.map((iv) => (
            <button
              key={iv}
              onClick={() => setInterval(iv)}
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
                interval === iv
                  ? 'bg-[var(--accent-current)]/20 text-[var(--accent-current)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              {iv}
            </button>
          ))}
        </div>
      }
    >
      {isLoading && tokens.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--text-muted)] border-t-[var(--accent-current)] animate-spin" />
        </div>
      ) : tokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <Brain size={20} className="text-[var(--text-muted)] opacity-30" />
          <p className="text-xs text-[var(--text-muted)]">No smart money data</p>
        </div>
      ) : (
        <div className="flex flex-col max-h-[380px] overflow-y-auto">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_70px_90px_60px] gap-2 px-2 py-1.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
            <span>Token</span>
            <span className="text-right">SM Buys</span>
            <span className="text-right">Net Flow</span>
            <span className="text-right">Trend</span>
          </div>

          {tokens.map((token: SmartMoneyRow, i: number) => (
            <div
              key={`${token.token ?? token.address}-${i}`}
              onClick={() => selectToken(token.token ?? token.address, token.symbol, token.logo_uri)}
              className="grid grid-cols-[1fr_70px_90px_60px] gap-2 items-center px-2 py-2 hover:bg-[var(--bg-hover)] cursor-pointer transition-colors rounded-md group"
            >
              {/* Token */}
              <div className="flex items-center gap-2 min-w-0">
                {token.logo_uri ? (
                  <img
                    src={token.logo_uri}
                    alt={token.symbol}
                    className="w-5 h-5 rounded-full shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[var(--bg-hover)] shrink-0" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent-current)] transition-colors">
                    {token.symbol}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] truncate">{token.name}</span>
                </div>
              </div>

              {/* SM Buys */}
              <span className="text-xs mono text-right text-[var(--positive)]">
                {token.smart_buy_no ?? token.smart_traders_no ?? 0}
              </span>

              {/* Net Flow */}
              <span className={cn(
                'text-xs mono text-right font-medium',
                (token.net_flow ?? 0) >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
              )}>
                {(token.net_flow ?? 0) >= 0 ? '+' : ''}${formatCompact(Math.abs(token.net_flow ?? 0))}
              </span>

              {/* Trend */}
              <div className="flex justify-end">
                {(token.net_flow ?? 0) >= 0 ? (
                  <TrendingUp size={12} className="text-[var(--positive)]" />
                ) : (
                  <TrendingDown size={12} className="text-[var(--negative)]" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};
