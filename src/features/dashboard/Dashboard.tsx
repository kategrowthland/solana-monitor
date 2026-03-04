import { Panel } from '@/components/shared/Panel';
import { TrendingTokensPanel } from './components/TrendingTokensPanel';
import { LiveTradeFeedPanel } from './components/LiveTradeFeedPanel';
import { NetworkGlobePanel } from './components/NetworkGlobePanel';
import { useUiStore } from '@/stores/uiStore';
import { VARIANTS } from '@/types/common';
import {
  Activity,
  Zap,
  Shield,
  BarChart3,
  Coins,
} from 'lucide-react';

const PLACEHOLDER_PANELS = [
  { title: 'Market Radar', icon: <BarChart3 size={14} />, span: '' },
  { title: 'Whale Activity', icon: <Activity size={14} />, span: '' },
  { title: 'DeFi Pulse', icon: <Coins size={14} />, span: '' },
  { title: 'Security Alerts', icon: <Shield size={14} />, span: '' },
  { title: 'Network Health', icon: <Zap size={14} />, span: '' },
];

export const Dashboard = () => {
  const activeVariant = useUiStore((s) => s.activeVariant);
  const config = VARIANTS.find((v) => v.id === activeVariant);

  return (
    <div className="grid grid-cols-4 gap-[var(--panel-gap)] auto-rows-[minmax(200px,1fr)]">
      {/* ✅ LIVE: Network Globe — spans 2 cols, 2 rows */}
      <NetworkGlobePanel />

      {/* ✅ LIVE: Trending Tokens — spans 2 cols for full table width */}
      <div className="col-span-2 row-span-2">
        <TrendingTokensPanel />
      </div>

      {/* ✅ LIVE: Live Trade Feed — spans 2 cols */}
      <div className="col-span-2 row-span-2">
        <LiveTradeFeedPanel />
      </div>

      {/* Remaining placeholders */}
      {PLACEHOLDER_PANELS.map((panel) => (
        <PlaceholderPanel
          key={panel.title}
          title={panel.title}
          icon={panel.icon}
          accentColor={config?.accentColor}
          className={panel.span}
        />
      ))}
    </div>
  );
};

// ─── Placeholder Panel ─────────────────────────────────────────────

interface PlaceholderPanelProps {
  title: string;
  icon: React.ReactNode;
  accentColor?: string;
  className?: string;
}

const PlaceholderPanel = ({ title, icon, accentColor, className }: PlaceholderPanelProps) => (
  <Panel title={title} icon={icon} className={className} collapsible>
    <div className="flex flex-col items-center justify-center h-full min-h-[120px] gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center opacity-20"
        style={{ backgroundColor: accentColor }}
      >
        {icon}
      </div>
      <p className="text-xs text-[var(--text-muted)]">Coming soon</p>
    </div>
  </Panel>
);
