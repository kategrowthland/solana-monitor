// ─── Mock Globe Data ─────────────────────────────────────────────
// Simulates whale transactions, token launches, and DeFi activity
// Will be replaced with real Birdeye API data later

export interface GlobeArc {
  id: string;
  sourcePosition: [number, number];  // [lng, lat]
  targetPosition: [number, number];
  amount: number;                     // USD value
  timestamp: number;
  token: string;
  direction: 'buy' | 'sell';
}

export interface GlobeDot {
  id: string;
  position: [number, number];
  name: string;
  symbol: string;
  timestamp: number;
  marketCap: number;
}

export interface GlobeHeatPoint {
  position: [number, number];
  weight: number;  // DeFi activity intensity 0–1
}

// Major crypto hub cities with coordinates [lng, lat]
const HUBS: [string, [number, number]][] = [
  ['New York', [-74.006, 40.7128]],
  ['London', [-0.1276, 51.5074]],
  ['Singapore', [103.8198, 1.3521]],
  ['Tokyo', [139.6917, 35.6895]],
  ['Dubai', [55.2708, 25.2048]],
  ['Hong Kong', [114.1694, 22.3193]],
  ['Seoul', [126.978, 37.5665]],
  ['San Francisco', [-122.4194, 37.7749]],
  ['Sydney', [151.2093, -33.8688]],
  ['Zurich', [8.5417, 47.3769]],
  ['Miami', [-80.1918, 25.7617]],
  ['Berlin', [13.405, 52.52]],
  ['São Paulo', [-46.6333, -23.5505]],
  ['Lagos', [3.3792, 6.5244]],
  ['Mumbai', [72.8777, 19.076]],
  ['Bangkok', [100.5018, 13.7563]],
  ['Jakarta', [106.8456, -6.2088]],
  ['Istanbul', [28.9784, 41.0082]],
  ['Taipei', [121.5654, 25.033]],
  ['Buenos Aires', [-58.3816, -34.6037]],
];

const TOKEN_NAMES = [
  ['BONK', 'Bonk'], ['JUP', 'Jupiter'], ['WIF', 'dogwifhat'],
  ['PYTH', 'Pyth'], ['JTO', 'Jito'], ['TNSR', 'Tensor'],
  ['W', 'Wormhole'], ['ORCA', 'Orca'], ['RAY', 'Raydium'],
  ['MNGO', 'Mango'], ['DRIFT', 'Drift'], ['KMNO', 'Kamino'],
];

const MEME_NAMES = [
  ['PNUT', 'Peanut'], ['POPCAT', 'Popcat'], ['MEW', 'cat in a dogs world'],
  ['MYRO', 'Myro'], ['SLERF', 'Slerf'], ['WEN', 'Wen'],
  ['BOME', 'Book of Meme'], ['SAMO', 'Samoyedcoin'],
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Jitter a position slightly to avoid exact overlaps
function jitter(pos: [number, number], amount: number = 5): [number, number] {
  return [
    pos[0] + rand(-amount, amount),
    pos[1] + rand(-amount, amount),
  ];
}

// ─── Whale Transaction Generator ────────────────────────────────

let arcIdCounter = 0;

export function generateWhaleArc(): GlobeArc {
  const [, sourcePos] = pick(HUBS);
  let [, targetPos] = pick(HUBS);
  // Ensure source !== target
  while (targetPos[0] === sourcePos[0] && targetPos[1] === sourcePos[1]) {
    [, targetPos] = pick(HUBS);
  }

  const [symbol, ] = pick([...TOKEN_NAMES, ...TOKEN_NAMES.slice(0, 3)]); // weight toward major tokens
  const amount = rand(50_000, 5_000_000);

  return {
    id: `arc-${arcIdCounter++}`,
    sourcePosition: jitter(sourcePos, 3),
    targetPosition: jitter(targetPos, 3),
    amount,
    timestamp: Date.now(),
    token: symbol,
    direction: Math.random() > 0.5 ? 'buy' : 'sell',
  };
}

// ─── Token Launch Generator ─────────────────────────────────────

let dotIdCounter = 0;

export function generateTokenLaunch(): GlobeDot {
  const [, pos] = pick(HUBS);
  const [symbol, name] = pick(MEME_NAMES);

  return {
    id: `dot-${dotIdCounter++}`,
    position: jitter(pos, 8),
    name,
    symbol,
    timestamp: Date.now(),
    marketCap: rand(1_000, 500_000),
  };
}

// ─── DeFi Activity Heat Map ─────────────────────────────────────

export function generateHeatPoints(): GlobeHeatPoint[] {
  const points: GlobeHeatPoint[] = [];

  for (const [, pos] of HUBS) {
    // Each hub generates a cluster of heat points
    const intensity = rand(0.3, 1);
    const clusterSize = Math.floor(rand(5, 20));

    for (let i = 0; i < clusterSize; i++) {
      points.push({
        position: jitter(pos, rand(2, 8)),
        weight: intensity * rand(0.5, 1),
      });
    }
  }

  return points;
}

// ─── Initial Data Sets ──────────────────────────────────────────

export function generateInitialArcs(count: number = 12): GlobeArc[] {
  return Array.from({ length: count }, () => {
    const arc = generateWhaleArc();
    // Spread timestamps over the last 30 seconds
    arc.timestamp = Date.now() - rand(0, 30_000);
    return arc;
  });
}

export function generateInitialDots(count: number = 8): GlobeDot[] {
  return Array.from({ length: count }, () => {
    const dot = generateTokenLaunch();
    dot.timestamp = Date.now() - rand(0, 60_000);
    return dot;
  });
}
