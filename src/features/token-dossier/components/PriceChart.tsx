import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTokenChart } from '../hooks/useTokenDossier';
import { formatPrice } from '@/utils/formatNumber';

interface PriceChartProps {
  address: string;
  timeframe: string;
}

export const PriceChart = ({ address, timeframe }: PriceChartProps) => {
  const { data, isLoading } = useTokenChart(address, timeframe);

  const chartData = useMemo(() => {
    if (!data?.items?.length) return [];
    return data.items.map((item) => ({
      time: item.unixTime * 1000,
      price: item.c,
    }));
  }, [data]);

  const isPositive = useMemo(() => {
    if (chartData.length < 2) return true;
    return chartData[chartData.length - 1].price >= chartData[0].price;
  }, [chartData]);

  const accentColor = isPositive ? '#00FF88' : '#FF4444';

  if (isLoading) {
    return (
      <div className="h-[180px] rounded-lg bg-[var(--bg-secondary)] animate-pulse flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--text-muted)] border-t-[var(--accent-current)] animate-spin" />
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="h-[180px] rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
        <p className="text-xs text-[var(--text-muted)]">No chart data</p>
      </div>
    );
  }

  return (
    <div className="h-[180px] rounded-lg bg-[var(--bg-secondary)] p-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`grad-${address}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(v) => {
              const d = new Date(v);
              return timeframe === '1H' || timeframe === '4H'
                ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }}
            tick={{ fontSize: 9, fill: '#555' }}
            axisLine={false}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={(v) => formatPrice(v)}
            tick={{ fontSize: 9, fill: '#555' }}
            axisLine={false}
            tickLine={false}
            width={60}
            orientation="right"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const point = payload[0].payload;
              return (
                <div className="bg-[var(--bg-panel)] border border-[var(--panel-border)] rounded-lg px-3 py-2 shadow-lg">
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {new Date(point.time).toLocaleString()}
                  </p>
                  <p className="text-sm mono font-medium" style={{ color: accentColor }}>
                    {formatPrice(point.price)}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={accentColor}
            strokeWidth={1.5}
            fill={`url(#grad-${address})`}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
