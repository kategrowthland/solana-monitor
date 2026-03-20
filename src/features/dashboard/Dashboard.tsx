import { TrendingTokensPanel } from './components/TrendingTokensPanel';
import { LiveTradeFeedPanel } from './components/LiveTradeFeedPanel';
import { WhaleRadarPanel } from './components/WhaleRadarPanel';
import { MemeMonitorPanel } from '@/features/meme-monitor';
import { NetworkHealthPanel } from '@/features/network-health';
import { DefiPulsePanel } from '@/features/defi-intel';
import { SecurityAlertsPanel } from '@/features/security';

export const Dashboard = () => {
  return (
    <div className="grid grid-cols-4 gap-[var(--panel-gap)] auto-rows-[minmax(200px,auto)]">
      {/* ✅ LIVE: Trending Tokens — spans 2 cols for full table width */}
      <div className="col-span-2 row-span-2">
        <TrendingTokensPanel />
      </div>

      {/* ✅ LIVE: Live Trade Feed — spans 2 cols */}
      <div className="col-span-2 row-span-2">
        <LiveTradeFeedPanel />
      </div>

      {/* ✅ LIVE: Whale & Smart Money Radar — spans 2 cols */}
      <WhaleRadarPanel />

      {/* ✅ LIVE: Meme Monitor — spans 2 cols, 2 rows */}
      <MemeMonitorPanel />

      {/* ✅ LIVE: Network Health — spans 2 cols, 2 rows */}
      <NetworkHealthPanel />

      {/* ✅ LIVE: DeFi Pulse — top gainers/losers */}
      <DefiPulsePanel />

      {/* ✅ LIVE: Security Alerts — token risk scanning */}
      <SecurityAlertsPanel />
    </div>
  );
};
