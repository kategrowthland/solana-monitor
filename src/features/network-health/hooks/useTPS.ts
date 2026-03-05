import { useQuery } from '@tanstack/react-query';
import { fetchTpsSamples } from '@/lib/solana';

const POLL_INTERVAL_MS = 10_000;

export type NetworkStatus = 'healthy' | 'degraded' | 'congested' | 'unknown';

export interface TpsPoint {
    t: number; // index (oldest = 0)
    tps: number;
}

export interface UseTpsReturn {
    currentTps: number;
    avgTps: number;
    peakTps: number;
    samples: TpsPoint[];
    status: NetworkStatus;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

const getStatus = (tps: number): NetworkStatus => {
    if (tps <= 0) return 'unknown';
    if (tps >= 2000) return 'healthy';
    if (tps >= 500) return 'degraded';
    return 'congested';
};

export const useTPS = (): UseTpsReturn => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['solana', 'tps-samples'],
        queryFn: () => fetchTpsSamples(60),
        refetchInterval: POLL_INTERVAL_MS,
        staleTime: 8_000,
        retry: 3,
    });

    const raw = data ?? [];

    const samples: TpsPoint[] = raw.map((s, i) => ({
        t: i,
        tps:
            s.samplePeriodSecs > 0
                ? Math.round(s.numTransactions / s.samplePeriodSecs)
                : 0,
    }));

    const tpsValues = samples.map((s) => s.tps).filter((v) => v > 0);
    const currentTps = samples.length > 0 ? samples[samples.length - 1].tps : 0;
    const avgTps =
        tpsValues.length > 0
            ? Math.round(tpsValues.slice(-15).reduce((a, b) => a + b, 0) / Math.min(15, tpsValues.length))
            : 0;
    const peakTps = tpsValues.length > 0 ? Math.max(...tpsValues) : 0;
    const status = getStatus(currentTps);

    return {
        currentTps,
        avgTps,
        peakTps,
        samples,
        status,
        isLoading,
        error: error as Error | null,
        refetch,
    };
};
