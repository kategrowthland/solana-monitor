import { useState, useEffect, useRef, useCallback } from 'react';
import {
  generateWhaleArc,
  generateTokenLaunch,
  generateHeatPoints,
  generateInitialArcs,
  generateInitialDots,
  type GlobeArc,
  type GlobeDot,
  type GlobeHeatPoint,
} from '../data/mockGlobeData';

const MAX_ARCS = 25;
const MAX_DOTS = 15;
const ARC_LIFETIME_MS = 15_000;   // arcs fade after 15s
const DOT_LIFETIME_MS = 30_000;   // dots fade after 30s
const ARC_INTERVAL_MS = 2_000;    // new whale tx every 2s
const DOT_INTERVAL_MS = 5_000;    // new token launch every 5s
const HEAT_REFRESH_MS = 20_000;   // refresh heat data every 20s

export function useGlobeData() {
  const [arcs, setArcs] = useState<GlobeArc[]>(() => generateInitialArcs(10));
  const [dots, setDots] = useState<GlobeDot[]>(() => generateInitialDots(6));
  const [heatPoints, setHeatPoints] = useState<GlobeHeatPoint[]>(() => generateHeatPoints());
  const [stats, setStats] = useState({ totalWhaleVolume: 0, activeLaunches: 0 });
  const animFrameRef = useRef<number>(0);

  // Prune expired items and add new ones
  const addArc = useCallback(() => {
    setArcs((prev) => {
      const now = Date.now();
      const alive = prev.filter((a) => now - a.timestamp < ARC_LIFETIME_MS);
      const trimmed = alive.length >= MAX_ARCS ? alive.slice(-MAX_ARCS + 1) : alive;
      return [...trimmed, generateWhaleArc()];
    });
  }, []);

  const addDot = useCallback(() => {
    setDots((prev) => {
      const now = Date.now();
      const alive = prev.filter((d) => now - d.timestamp < DOT_LIFETIME_MS);
      const trimmed = alive.length >= MAX_DOTS ? alive.slice(-MAX_DOTS + 1) : alive;
      return [...trimmed, generateTokenLaunch()];
    });
  }, []);

  // Periodic data injection
  useEffect(() => {
    const arcTimer = setInterval(addArc, ARC_INTERVAL_MS);
    const dotTimer = setInterval(addDot, DOT_INTERVAL_MS);
    const heatTimer = setInterval(() => setHeatPoints(generateHeatPoints()), HEAT_REFRESH_MS);

    return () => {
      clearInterval(arcTimer);
      clearInterval(dotTimer);
      clearInterval(heatTimer);
    };
  }, [addArc, addDot]);

  // Update stats
  useEffect(() => {
    setStats({
      totalWhaleVolume: arcs.reduce((sum, a) => sum + a.amount, 0),
      activeLaunches: dots.length,
    });
  }, [arcs, dots]);

  // Animation time (for pulsing dots, arc fade)
  const [animTime, setAnimTime] = useState(0);

  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      setAnimTime(Date.now());
      animFrameRef.current = requestAnimationFrame(tick);
    };
    // Throttle to ~30fps for performance
    const interval = setInterval(() => {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(tick);
    }, 33);

    return () => {
      running = false;
      clearInterval(interval);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return { arcs, dots, heatPoints, stats, animTime };
}
