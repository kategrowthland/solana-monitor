import { useQuery } from '@tanstack/react-query';
import { fetchVoteAccounts } from '@/lib/solana';
import type { VoteAccountInfo } from '@/lib/solana';

const POLL_INTERVAL_MS = 60_000; // expensive call — once per minute

export interface ValidatorSummary {
    votePubkey: string;
    nodePubkey: string;
    activatedStake: number;
    stakePercent: number;
    commission: number;
    lastVote: number;
    isDelinquent: boolean;
}

export interface UseValidatorsReturn {
    totalActive: number;
    totalDelinquent: number;
    totalStake: number;
    nakamotoCoeff: number;  // fewest validators to control 33%+ of stake
    topValidators: ValidatorSummary[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

const computeNakamoto = (sorted: ValidatorSummary[], totalStake: number): number => {
    let cumulative = 0;
    let count = 0;
    for (const v of sorted) {
        cumulative += v.activatedStake;
        count++;
        if (cumulative / totalStake > 0.33) break;
    }
    return count;
};

export const useValidators = (): UseValidatorsReturn => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['solana', 'vote-accounts'],
        queryFn: fetchVoteAccounts,
        refetchInterval: POLL_INTERVAL_MS,
        staleTime: 50_000,
        retry: 2,
    });

    const current: VoteAccountInfo[] = data?.current ?? [];
    const delinquent: VoteAccountInfo[] = data?.delinquent ?? [];

    const totalActive = current.length;
    const totalDelinquent = delinquent.length;

    const allCurrent = [...current].sort(
        (a, b) => b.activatedStake - a.activatedStake
    );
    const totalStake = allCurrent.reduce((s, v) => s + v.activatedStake, 0);

    const toSummary = (v: VoteAccountInfo, isDelinquent: boolean): ValidatorSummary => ({
        votePubkey: v.votePubkey,
        nodePubkey: v.nodePubkey,
        activatedStake: v.activatedStake,
        stakePercent: totalStake > 0 ? (v.activatedStake / totalStake) * 100 : 0,
        commission: v.commission,
        lastVote: v.lastVote,
        isDelinquent,
    });

    const topValidators = allCurrent.slice(0, 15).map((v) => toSummary(v, false));

    const nakamotoCoeff =
        allCurrent.length > 0 ? computeNakamoto(topValidators, totalStake) : 0;

    return {
        totalActive,
        totalDelinquent,
        totalStake,
        nakamotoCoeff,
        topValidators,
        isLoading,
        error: error as Error | null,
        refetch,
    };
};
