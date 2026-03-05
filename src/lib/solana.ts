import { Connection } from '@solana/web3.js';

// ─── Singleton connection ─────────────────────────────────────────

// Ankr's free public RPC has better CORS support and higher rate limits
// than api.mainnet-beta.solana.com for browser-based clients
export const solanaConnection = new Connection(
    import.meta.env.VITE_SOLANA_RPC_URL || 'https://rpc.ankr.com/solana',
    'confirmed'
);

// ─── TPS Samples ─────────────────────────────────────────────────

export interface TpsSample {
    numTransactions: number;
    numSlots: number;
    samplePeriodSecs: number;
    slot: number;
}

export const fetchTpsSamples = async (limit = 60): Promise<TpsSample[]> => {
    const samples = await solanaConnection.getRecentPerformanceSamples(limit);
    // SDK returns newest-first; reverse so we get chronological order
    return [...samples].reverse();
};

// ─── Epoch Info ───────────────────────────────────────────────────

export interface SolanaEpochInfo {
    epoch: number;
    slotIndex: number;
    slotsInEpoch: number;
    absoluteSlot: number;
    blockHeight?: number;
    transactionCount?: number;
}

export const fetchEpochInfo = async (): Promise<SolanaEpochInfo> => {
    const info = await solanaConnection.getEpochInfo();
    return {
        epoch: info.epoch,
        slotIndex: info.slotIndex,
        slotsInEpoch: info.slotsInEpoch,
        absoluteSlot: info.absoluteSlot,
        blockHeight: info.blockHeight,
        transactionCount: info.transactionCount,
    };
};

// ─── Vote Accounts ────────────────────────────────────────────────

export interface VoteAccountInfo {
    votePubkey: string;
    nodePubkey: string;
    activatedStake: number;
    commission: number;
    epochCredits: { epoch: number; credits: number; previousCredits: number }[];
    lastVote: number;
}

export interface VoteAccountsResult {
    current: VoteAccountInfo[];
    delinquent: VoteAccountInfo[];
}

export const fetchVoteAccounts = async (): Promise<VoteAccountsResult> => {
    const result = await solanaConnection.getVoteAccounts();
    const map = (v: typeof result.current[0]): VoteAccountInfo => ({
        votePubkey: v.votePubkey,
        nodePubkey: v.nodePubkey,
        activatedStake: v.activatedStake,
        commission: v.commission,
        epochCredits: v.epochCredits.map((ec) => ({
            epoch: ec[0],
            credits: ec[1],
            previousCredits: ec[2],
        })),
        lastVote: v.lastVote,
    });
    return {
        current: result.current.map(map),
        delinquent: result.delinquent.map(map),
    };
};

// ─── Current Slot ─────────────────────────────────────────────────

export const fetchCurrentSlot = async (): Promise<number> => {
    return solanaConnection.getSlot();
};
