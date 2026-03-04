import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Shield, Users, BarChart3, Activity, Copy, Check } from 'lucide-react';
import { useTokenStore } from '@/stores/tokenStore';
import {
  useTokenOverview,
  useTokenSecurity,
  useTokenHolders,
  useTokenTrades,
} from '../hooks/useTokenDossier';
import { PriceChart } from './PriceChart';
import { formatPrice, formatCompact, formatPercent } from '@/utils/formatNumber';
import { truncateAddress } from '@/utils/formatAddress';
import { timeAgo } from '@/utils/formatTime';
import { cn } from '@/lib/utils';
import type { BirdeyeV3TokenTrade } from '@/types/birdeye';

type Tab = 'overview' | 'holders' | 'trades' | 'security';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={12} /> },
  { id: 'holders', label: 'Holders', icon: <Users size={12} /> },
  { id: 'trades', label: 'Trades', icon: <Activity size={12} /> },
  { id: 'security', label: 'Security', icon: <Shield size={12} /> },
];

export const TokenDossier = () => {
  const { selectedTokenAddress, dossierOpen, closeDossier } = useTokenStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <AnimatePresence>
      {dossierOpen && selectedTokenAddress && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={closeDossier}
          />

          {/* Side panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[var(--bg-panel)] border-l border-[var(--panel-border)] shadow-2xl flex flex-col"
          >
            <DossierHeader onClose={closeDossier} />
            <DossierTabs activeTab={activeTab} onChange={setActiveTab} />
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'overview' && <OverviewTab address={selectedTokenAddress} />}
              {activeTab === 'holders' && <HoldersTab address={selectedTokenAddress} />}
              {activeTab === 'trades' && <TradesTab address={selectedTokenAddress} />}
              {activeTab === 'security' && <SecurityTab address={selectedTokenAddress} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Header ────────────────────────────────────────────────────────

const DossierHeader = ({ onClose }: { onClose: () => void }) => {
  const { selectedTokenAddress, selectedTokenSymbol, selectedTokenLogo } = useTokenStore();
  const { data } = useTokenOverview(selectedTokenAddress);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (selectedTokenAddress) {
      navigator.clipboard.writeText(selectedTokenAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--panel-border)] bg-[var(--bg-panel-header)]">
      <div className="flex items-center gap-3">
        {(selectedTokenLogo || data?.logoURI) ? (
          <img
            src={selectedTokenLogo || data?.logoURI}
            alt={selectedTokenSymbol ?? ''}
            className="w-9 h-9 rounded-full bg-[var(--bg-hover)]"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[var(--bg-hover)] flex items-center justify-center">
            <span className="text-xs text-[var(--text-muted)]">{selectedTokenSymbol?.slice(0, 2)}</span>
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            {data?.name ?? selectedTokenSymbol}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              {data?.symbol ?? selectedTokenSymbol}
            </span>
            <button onClick={copyAddress} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
              {copied ? <Check size={10} className="text-[var(--positive)]" /> : <Copy size={10} />}
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {data?.extensions?.website && (
          <a
            href={data.extensions.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
          >
            <ExternalLink size={14} />
          </a>
        )}
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Tabs ──────────────────────────────────────────────────────────

const DossierTabs = ({ activeTab, onChange }: { activeTab: Tab; onChange: (t: Tab) => void }) => (
  <div className="flex border-b border-[var(--panel-border)] px-5 gap-1">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px',
          activeTab === tab.id
            ? 'border-[var(--accent-current)] text-[var(--text-primary)]'
            : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
        )}
      >
        {tab.icon}
        {tab.label}
      </button>
    ))}
  </div>
);

// ─── Overview Tab ──────────────────────────────────────────────────

const OverviewTab = ({ address }: { address: string }) => {
  const { data, isLoading } = useTokenOverview(address);
  const [chartTimeframe, setChartTimeframe] = useState('1D');

  if (isLoading) return <TabLoader />;
  if (!data) return <TabEmpty message="No overview data" />;

  const change24h = data.priceChange24hPercent ?? 0;

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Price header */}
      <div>
        <p className="text-2xl font-bold mono text-[var(--text-primary)] tabular-nums">
          {formatPrice(data.price)}
        </p>
        <p className={cn('text-sm mono font-medium', change24h >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]')}>
          {formatPercent(change24h)} <span className="text-[var(--text-muted)] text-xs font-normal">24h</span>
        </p>
      </div>

      {/* Chart */}
      <div>
        <div className="flex items-center gap-1 mb-3">
          {['1H', '4H', '1D', '1W', '1M'].map((tf) => (
            <button
              key={tf}
              onClick={() => setChartTimeframe(tf)}
              className={cn(
                'px-2 py-1 rounded text-[10px] font-medium',
                chartTimeframe === tf
                  ? 'bg-[var(--accent-current)]/20 text-[var(--accent-current)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              {tf}
            </button>
          ))}
        </div>
        <PriceChart address={address} timeframe={chartTimeframe} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Market Cap" value={`$${formatCompact(data.marketCap ?? 0)}`} />
        <StatCard label="FDV" value={`$${formatCompact(data.fdv ?? 0)}`} />
        <StatCard label="Liquidity" value={`$${formatCompact(data.liquidity ?? 0)}`} />
        <StatCard label="Volume 24h" value={`$${formatCompact(data.v24hUSD ?? 0)}`} />
        <StatCard label="Holders" value={formatCompact(data.holder ?? 0)} />
        <StatCard label="Trades 24h" value={formatCompact(data.trade24h ?? 0)} />
        <StatCard label="Buyers 24h" value={formatCompact(data.buy24h ?? 0)} subColor="var(--positive)" />
        <StatCard label="Sellers 24h" value={formatCompact(data.sell24h ?? 0)} subColor="var(--negative)" />
      </div>

      {/* Description */}
      {data.extensions?.description && (
        <div>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">About</p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {data.extensions.description}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Holders Tab ───────────────────────────────────────────────────

const HoldersTab = ({ address }: { address: string }) => {
  const { data, isLoading } = useTokenHolders(address);
  const { data: overview } = useTokenOverview(address);

  if (isLoading) return <TabLoader />;
  if (!data?.items?.length) return <TabEmpty message="No holder data available" />;

  const totalSupply = overview?.circulatingSupply ?? overview?.totalSupply ?? 0;

  return (
    <div className="p-5">
      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-[32px_1fr_auto_auto] gap-3 px-2 pb-2 border-b border-[var(--panel-border)]">
          <span className="text-[10px] text-[var(--text-muted)]">#</span>
          <span className="text-[10px] text-[var(--text-muted)]">Address</span>
          <span className="text-[10px] text-[var(--text-muted)] text-right">Amount</span>
          <span className="text-[10px] text-[var(--text-muted)] text-right w-16">% Supply</span>
        </div>
        {data.items.map((holder, i) => (
          <div key={holder.owner ?? holder.token_account} className="grid grid-cols-[32px_1fr_auto_auto] gap-3 px-2 py-2 rounded hover:bg-[var(--bg-hover)]">
            <span className="text-xs mono text-[var(--text-muted)]">{i + 1}</span>
            <span className="text-xs mono text-[var(--text-secondary)] truncate">{truncateAddress(holder.owner, 6, 4)}</span>
            <span className="text-xs mono text-[var(--text-primary)] tabular-nums text-right">{formatCompact(holder.ui_amount)}</span>
            <span className="text-xs mono text-[var(--text-muted)] tabular-nums text-right w-16">
              {totalSupply > 0 ? ((holder.ui_amount / totalSupply) * 100).toFixed(2) : '—'}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Trades Tab ────────────────────────────────────────────────────

const TradesTab = ({ address }: { address: string }) => {
  const { data, isLoading } = useTokenTrades(address);

  if (isLoading) return <TabLoader />;
  if (!data?.items?.length) return <TabEmpty message="No recent trades" />;

  return (
    <div className="p-5 flex flex-col gap-1">
      {data.items.map((trade: BirdeyeV3TokenTrade, i: number) => {
        const isBuy = trade.side === 'buy';
        return (
          <div key={`${trade.tx_hash}-${i}`} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-[var(--bg-hover)]">
            <div className={cn('w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold',
              isBuy ? 'bg-[var(--positive)]/15 text-[var(--positive)]' : 'bg-[var(--negative)]/15 text-[var(--negative)]'
            )}>
              {isBuy ? 'B' : 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs mono text-[var(--text-secondary)] truncate block">{truncateAddress(trade.owner)}</span>
            </div>
            <span className={cn('text-xs mono tabular-nums font-medium', isBuy ? 'text-[var(--positive)]' : 'text-[var(--negative)]')}>
              {isBuy ? '+' : '-'}${formatCompact(trade.volume_usd)}
            </span>
            <span className="text-[10px] mono text-[var(--text-muted)] w-16 text-right">{timeAgo(trade.block_unix_time)}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Security Tab ──────────────────────────────────────────────────

const SecurityTab = ({ address }: { address: string }) => {
  const { data, isLoading } = useTokenSecurity(address);

  if (isLoading) return <TabLoader />;
  if (!data) return <TabEmpty message="No security data" />;

  const checks = [
    { label: 'Jupiter Strict List', value: data.jupStrictList, good: true },
    { label: 'Mutable Metadata', value: data.mutableMetadata, good: false },
    { label: 'Freeze Authority', value: !!data.freezeAuthority, good: false },
    { label: 'Transfer Fee', value: !!data.transferFeeEnable, good: false },
    { label: 'Token 2022', value: data.isToken2022, good: null },
  ];

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Security checks */}
      <div>
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-3">Security Checks</p>
        <div className="flex flex-col gap-2">
          {checks.map((check) => (
            <div key={check.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-secondary)]">
              <span className="text-xs text-[var(--text-secondary)]">{check.label}</span>
              <span className={cn(
                'text-xs font-medium',
                check.value === null || check.good === null
                  ? 'text-[var(--text-muted)]'
                  : (check.value === check.good)
                    ? 'text-[var(--positive)]'
                    : 'text-[var(--warning)]'
              )}>
                {check.value ? 'Yes' : 'No'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Concentration */}
      <div>
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-3">Holder Concentration</p>
        <div className="flex flex-col gap-2">
          <StatCard label="Top 10 Holders" value={`${((data.top10HolderPercent ?? 0) * 100).toFixed(1)}%`} />
          <StatCard label="Creator Balance" value={`${((data.creatorPercentage ?? 0) * 100).toFixed(2)}%`} />
        </div>
      </div>

      {/* Creator info */}
      <div>
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Creator</p>
        <p className="text-xs mono text-[var(--text-secondary)]">{truncateAddress(data.creatorAddress, 8, 6)}</p>
        {data.creationTime && (
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Created {timeAgo(data.creationTime)}</p>
        )}
      </div>
    </div>
  );
};

// ─── Shared Helpers ────────────────────────────────────────────────

const StatCard = ({ label, value, subColor }: { label: string; value: string; subColor?: string }) => (
  <div className="flex flex-col gap-1 px-3 py-2.5 rounded-lg bg-[var(--bg-secondary)]">
    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
    <span className="text-sm mono font-medium tabular-nums" style={subColor ? { color: subColor } : { color: 'var(--text-primary)' }}>
      {value}
    </span>
  </div>
);

const TabLoader = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-5 h-5 rounded-full border-2 border-[var(--text-muted)] border-t-[var(--accent-current)] animate-spin" />
  </div>
);

const TabEmpty = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-2">
    <p className="text-xs text-[var(--text-muted)]">{message}</p>
  </div>
);
