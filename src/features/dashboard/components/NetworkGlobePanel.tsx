import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Deck, _GlobeView as GlobeView } from '@deck.gl/core';
import { ArcLayer, ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { Panel } from '@/components/shared/Panel';
import { useGlobeData } from '../hooks/useGlobeData';
import { formatCompact } from '@/utils/formatNumber';
import { Globe, Waves, Rocket } from 'lucide-react';
import type { GlobeArc, GlobeDot, GlobeHeatPoint } from '../data/mockGlobeData';

// ─── Constants ─────────────────────────────────────────────────────

const ARC_LIFETIME = 15_000;
const DOT_LIFETIME = 30_000;

const INITIAL_VIEW_STATE = {
  longitude: 20,
  latitude: 20,
  zoom: 0.8,
};

// ─── Globe Component ──────────────────────────────────────────────

export const NetworkGlobePanel = () => {
  const { arcs, dots, heatPoints, stats, animTime } = useGlobeData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deckRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [size, setSize] = useState({ width: 400, height: 400 });

  // ─── Resize Observer ──────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ width, height });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ─── Layers ───────────────────────────────────────────────────
  const layers = useMemo(() => {
    const now = animTime || Date.now();

    return [
      // Heat layer — DeFi activity
      new HeatmapLayer<GlobeHeatPoint>({
        id: 'defi-heat',
        data: heatPoints,
        getPosition: (d) => d.position,
        getWeight: (d) => d.weight,
        radiusPixels: 60,
        intensity: 0.6,
        threshold: 0.05,
        colorRange: [
          [0, 255, 136, 0],     // transparent green
          [0, 255, 136, 40],
          [0, 212, 255, 80],
          [0, 212, 255, 120],
          [247, 147, 26, 160],  // orange
          [255, 68, 68, 200],   // red
        ],
      }),

      // Arc layer — whale transactions
      new ArcLayer<GlobeArc>({
        id: 'whale-arcs',
        data: arcs,
        getSourcePosition: (d) => d.sourcePosition,
        getTargetPosition: (d) => d.targetPosition,
        getSourceColor: (d) => {
          const age = (now - d.timestamp) / ARC_LIFETIME;
          const alpha = Math.max(0, 1 - age) * 220;
          return d.direction === 'buy'
            ? [0, 255, 136, alpha]   // green
            : [255, 68, 68, alpha];  // red
        },
        getTargetColor: (d) => {
          const age = (now - d.timestamp) / ARC_LIFETIME;
          const alpha = Math.max(0, 1 - age) * 220;
          return d.direction === 'buy'
            ? [0, 212, 255, alpha]   // cyan
            : [255, 170, 0, alpha];  // orange
        },
        getWidth: (d) => Math.min(4, 1 + Math.log10(d.amount / 50_000) * 1.5),
        greatCircle: true,
        numSegments: 50,
        updateTriggers: {
          getSourceColor: [now],
          getTargetColor: [now],
        },
      }),

      // Scatterplot — pulsing token launch dots
      new ScatterplotLayer<GlobeDot>({
        id: 'launch-dots',
        data: dots,
        getPosition: (d) => d.position,
        getFillColor: (d) => {
          const age = (now - d.timestamp) / DOT_LIFETIME;
          const alpha = Math.max(0, 1 - age) * 200;
          return [0, 255, 136, alpha];
        },
        getRadius: (d) => {
          const age = (now - d.timestamp) / DOT_LIFETIME;
          const base = 40_000 + (d.marketCap / 500_000) * 60_000;
          // Pulse effect: oscillate radius
          const pulse = 1 + Math.sin(now / 400 + d.position[0]) * 0.3;
          return base * pulse * Math.max(0.2, 1 - age * 0.7);
        },
        radiusUnits: 'meters',
        stroked: true,
        getLineColor: (d) => {
          const age = (now - d.timestamp) / DOT_LIFETIME;
          const alpha = Math.max(0, 1 - age) * 150;
          return [0, 255, 136, alpha];
        },
        lineWidthMinPixels: 1,
        updateTriggers: {
          getFillColor: [now],
          getRadius: [now],
          getLineColor: [now],
        },
      }),

      // Outer glow ring for dots
      new ScatterplotLayer<GlobeDot>({
        id: 'launch-rings',
        data: dots,
        getPosition: (d) => d.position,
        getFillColor: [0, 0, 0, 0],
        getRadius: (d) => {
          const age = (now - d.timestamp) / DOT_LIFETIME;
          const base = 60_000 + (d.marketCap / 500_000) * 80_000;
          const pulse = 1 + Math.sin(now / 600 + d.position[1]) * 0.4;
          return base * pulse * Math.max(0.1, 1 - age * 0.8);
        },
        radiusUnits: 'meters',
        stroked: true,
        getLineColor: (d) => {
          const age = (now - d.timestamp) / DOT_LIFETIME;
          const alpha = Math.max(0, 1 - age) * 80;
          return [0, 212, 255, alpha];
        },
        lineWidthMinPixels: 1,
        updateTriggers: {
          getRadius: [now],
          getLineColor: [now],
        },
      }),
    ];
  }, [arcs, dots, heatPoints, animTime]);

  // ─── Deck.gl Instance ─────────────────────────────────────────
  const onViewStateChange = useCallback(({ viewState: vs }: { viewState: typeof INITIAL_VIEW_STATE }) => {
    setViewState(vs);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (!deckRef.current) {
      deckRef.current = new Deck({
        canvas: canvasRef.current,
        views: new GlobeView({ resolution: 10 }),
        initialViewState: INITIAL_VIEW_STATE,
        controller: true,
        onViewStateChange,
        parameters: {},
        layers: [],
        getCursor: () => 'grab',
      });
    }

    deckRef.current.setProps({
      width: size.width,
      height: size.height,
      layers,
      viewState,
    });
  }, [layers, size, viewState, onViewStateChange]);

  // Cleanup
  useEffect(() => {
    return () => {
      deckRef.current?.finalize();
      deckRef.current = null;
    };
  }, []);

  return (
    <Panel
      title="Network Globe"
      icon={<Globe size={14} />}
      className="col-span-2 row-span-2"
      headerAction={<GlobeStats stats={stats} />}
      noPadding
    >
      <div ref={containerRef} className="relative w-full h-full min-h-[250px]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ background: 'radial-gradient(ellipse at center, #0d1117 0%, #040608 70%)' }}
        />

        {/* Legend overlay */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          <LegendItem color="#00FF88" label="Whale Buy" icon={<Waves size={10} />} />
          <LegendItem color="#FF4444" label="Whale Sell" icon={<Waves size={10} />} />
          <LegendItem color="#00D4FF" label="Token Launch" icon={<Rocket size={10} />} />
        </div>
      </div>
    </Panel>
  );
};

// ─── Stats Badge ────────────────────────────────────────────────

const GlobeStats = ({ stats }: { stats: { totalWhaleVolume: number; activeLaunches: number } }) => (
  <div className="flex items-center gap-3 text-[10px]">
    <span className="text-[var(--text-muted)]">
      Whales: <span className="text-[var(--positive)] mono">${formatCompact(stats.totalWhaleVolume)}</span>
    </span>
    <span className="text-[var(--text-muted)]">
      Launches: <span className="text-[var(--accent-defi)] mono">{stats.activeLaunches}</span>
    </span>
  </div>
);

// ─── Legend Item ─────────────────────────────────────────────────

const LegendItem = ({ color, label, icon }: { color: string; label: string; icon: React.ReactNode }) => (
  <div className="flex items-center gap-1.5">
    <span style={{ color }} className="opacity-80">{icon}</span>
    <span className="text-[9px] text-[var(--text-muted)]">{label}</span>
  </div>
);
