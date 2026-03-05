import { useQuery } from '@tanstack/react-query';
import { fetchEpochInfo } from '@/lib/solana';

const POLL_INTERVAL_MS = 15_000;
const AVG_SLOT_TIME_MS = 400; // Solana target ~400ms/slot

export interface UseEpochReturn {
    epoch: number;
    slotIndex: number;
    slotsInEpoch: number;
    absoluteSlot: number;
    progress: number;        // 0-100
    slotsRemaining: number;
    estimatedSecondsLeft: number;
    blockHeight: number;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

export const useEpochInfo = (): UseEpochReturn => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['solana', 'epoch-info'],
        queryFn: fetchEpochInfo,
        refetchInterval: POLL_INTERVAL_MS,
        staleTime: 12_000,
        retry: 3,
    });

    const epoch = data?.epoch ?? 0;
    const slotIndex = data?.slotIndex ?? 0;
    const slotsInEpoch = data?.slotsInEpoch ?? 1;
    const absoluteSlot = data?.absoluteSlot ?? 0;
    const blockHeight = data?.blockHeight ?? 0;

    const progress = slotsInEpoch > 0 ? (slotIndex / slotsInEpoch) * 100 : 0;
    const slotsRemaining = slotsInEpoch - slotIndex;
    const estimatedSecondsLeft = Math.round(
        (slotsRemaining * AVG_SLOT_TIME_MS) / 1000
    );

    return {
        epoch,
        slotIndex,
        slotsInEpoch,
        absoluteSlot,
        progress,
        slotsRemaining,
        estimatedSecondsLeft,
        blockHeight,
        isLoading,
        error: error as Error | null,
        refetch,
    };
};
