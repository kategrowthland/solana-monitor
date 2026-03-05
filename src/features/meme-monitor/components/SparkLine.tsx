import { useId, useMemo } from 'react';

interface SparkLineProps {
    points: number[];
    width?: number;
    height?: number;
    className?: string;
}

/**
 * Lightweight pure-SVG sparkline — no Recharts dependency.
 * Gradient ID uses React's useId() so it's stable and unique per instance.
 */
export const SparkLine = ({
    points,
    width = 80,
    height = 28,
    className,
}: SparkLineProps) => {
    // useId() gives a stable, unique-per-instance string safe for SVG IDs
    const id = useId();
    const gradientId = `spark${id.replace(/[^a-zA-Z0-9]/g, '')}`;

    const derived = useMemo(() => {
        if (points.length < 2) return null;

        const min = Math.min(...points);
        const max = Math.max(...points);
        const range = max - min || 1;
        const pad = 2;

        const xs = points.map(
            (_, i) => pad + (i / (points.length - 1)) * (width - pad * 2)
        );
        const ys = points.map(
            (v) => pad + ((max - v) / range) * (height - pad * 2)
        );

        const coords = xs.map((x, i) => `${x.toFixed(2)},${ys[i].toFixed(2)}`);
        const pathD = `M ${coords.join(' L ')}`;
        const fillD = `${pathD} L ${xs[xs.length - 1].toFixed(2)},${height} L ${xs[0].toFixed(2)},${height} Z`;
        const isPositive = points[points.length - 1] >= points[0];

        return { pathD, fillD, isPositive };
    }, [points, width, height]);

    if (!derived) return null;

    const { pathD, fillD, isPositive } = derived;
    const color = isPositive ? '#00FF88' : '#FF4757';

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className={className}
            style={{ overflow: 'visible' }}
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <path d={fillD} fill={`url(#${gradientId})`} />
            <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
