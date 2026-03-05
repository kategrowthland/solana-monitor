import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import type { TpsPoint } from '../hooks/useTPS';

interface TpsChartProps {
    samples: TpsPoint[];
    peakTps: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const tps: number = payload[0]?.value ?? 0;
    return (
        <div className="bg-[var(--bg-panel)] border border-[var(--panel-border)] rounded-lg px-2.5 py-1.5 text-xs shadow-lg">
            <span className="text-[var(--text-muted)]">TPS: </span>
            <span className="text-[var(--text-primary)] mono font-semibold tabular-nums">
                {tps.toLocaleString()}
            </span>
        </div>
    );
};

export const TpsChart = ({ samples, peakTps }: TpsChartProps) => {
    if (samples.length < 2) {
        return (
            <div className="flex items-center justify-center h-[100px]">
                <div className="w-4 h-4 rounded-full border-2 border-[var(--text-muted)] border-t-[var(--accent-current)] animate-spin" />
            </div>
        );
    }

    // Reference line: show peak if it exists
    const showPeak = peakTps > 0;

    return (
        <div className="w-full h-[110px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={samples} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="tpsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F7931A" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#F7931A" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>

                    <XAxis dataKey="t" hide />
                    <YAxis
                        tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
                        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                        width={32}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />

                    {showPeak && (
                        <ReferenceLine
                            y={peakTps}
                            stroke="rgba(247,147,26,0.3)"
                            strokeDasharray="3 3"
                            label={{
                                value: `peak ${peakTps.toLocaleString()}`,
                                position: 'right',
                                fill: 'var(--text-muted)',
                                fontSize: 8,
                                fontFamily: 'JetBrains Mono',
                            }}
                        />
                    )}

                    <Area
                        type="monotone"
                        dataKey="tps"
                        stroke="#F7931A"
                        strokeWidth={1.5}
                        fill="url(#tpsGrad)"
                        dot={false}
                        activeDot={{ r: 3, fill: '#F7931A', strokeWidth: 0 }}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
