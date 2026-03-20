// ─── Solana JSON-RPC helpers (no @solana/web3.js — avoids Vite polyfill issues) ──

const RPC_URL =
    (typeof import.meta !== 'undefined' && (import.meta as Record<string, unknown>).env
        ? (import.meta as { env: Record<string, string> }).env.VITE_SOLANA_RPC_URL
        : undefined) || 'https://rpc.ankr.com/solana';

let _reqId = 0;

async function rpc<T>(method: string, params: unknown[] = []): Promise<T> {
    const res = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: ++_reqId, method, params }),
    });
    if (!res.ok) throw new Error(`Solana RPC ${method} HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(`Solana RPC ${method}: ${json.error.message}`);
    return json.result as T;
}

// ─── TPS Samples ─────────────────────────────────────────────────

export interface TpsSample {
    numTransactions: number;
    numSlots: number;
    samplePeriodSecs: number;
    slot: number;
}

export const fetchTpsSamples = async (limit = 60): Promise<TpsSample[]> => {
    const samples = await rpc<TpsSample[]>('getRecentPerformanceSamples', [limit]);
    // RPC returns newest-first; reverse to get chronological order
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
    return rpc<SolanaEpochInfo>('getEpochInfo', []);
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

interface RawVoteAccount {
    votePubkey: string;
    nodePubkey: string;
    activatedStake: number;
    commission: number;
    epochCredits: [number, number, number][];
    lastVote: number;
}

interface RawVoteAccountsResult {
    current: RawVoteAccount[];
    delinquent: RawVoteAccount[];
}

export const fetchVoteAccounts = async (): Promise<VoteAccountsResult> => {
    const result = await rpc<RawVoteAccountsResult>('getVoteAccounts', []);
    const map = (v: RawVoteAccount): VoteAccountInfo => ({
        votePubkey: v.votePubkey,
        nodePubkey: v.nodePubkey,
        activatedStake: v.activatedStake,
        commission: v.commission,
        epochCredits: (v.epochCredits ?? []).map(([epoch, credits, previousCredits]) => ({
            epoch,
            credits,
            previousCredits,
        })),
        lastVote: v.lastVote,
    });
    return {
        current: (result.current ?? []).map(map),
        delinquent: (result.delinquent ?? []).map(map),
    };
};

// ─── Current Slot ─────────────────────────────────────────────────

export const fetchCurrentSlot = async (): Promise<number> => {
    return rpc<number>('getSlot', []);
};
