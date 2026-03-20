import { TrendingTokensPanel } from './components/TrendingTokensPanel';
import { LiveTradeFeedPanel } from './components/LiveTradeFeedPanel';
import { WhaleRadarPanel } from './components/WhaleRadarPanel';
import { MemeMonitorPanel } from '@/features/meme-monitor';
import { DefiPulsePanel } from '@/features/defi-intel';
import { SmartMoneyPanel } from '@/features/smart-money/components/SmartMoneyPanel';

export const Dashboard = () => {
  return (
    <div className="grid grid-cols-4 gap-[var(--panel-gap)] auto-rows-[minmax(200px,auto)]">
      {/* Trending Tokens — 2 cols */}
      <div className="col-span-2 row-span-2">
        <TrendingTokensPanel />
      </div>

      {/* Live Trade Feed — 2 cols */}
      <div className="col-span-2 row-span-2">
        <LiveTradeFeedPanel />
      </div>

      {/* Whale Radar — 2 cols, 2 rows */}
      <WhaleRadarPanel />

      {/* Meme Monitor — 2 cols, 2 rows */}
      <MemeMonitorPanel />

      {/* Smart Money — 2 cols */}
      <SmartMoneyPanel />

      {/* DeFi Pulse — 2 cols */}
      <DefiPulsePanel />
    </div>
  );
};
