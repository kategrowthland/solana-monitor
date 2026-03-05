import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { truncateAddress } from '@/utils/formatAddress';
import type { ValidatorSummary } from '../hooks/useValidators';

interface ValidatorListProps {
    validators: ValidatorSummary[];
    totalStake: number;
    nakamotoCoeff: number;
    isLoading?: boolean;
}

const lamportsToSol = (lamports: number) => lamports / 1e9;

const formatSol = (lamports: number): string => {
    const sol = lamportsToSol(lamports);
    if (sol >= 1_000_000) return `${(sol / 1_000_000).toFixed(2)}M`;
    if (sol >= 1_000) return `${(sol / 1_000).toFixed(1)}K`;
    return sol.toFixed(0);
};

export const ValidatorList = ({
    validators,
    nakamotoCoeff,
    isLoading,
}: ValidatorListProps) => {
    if (isLoading && validators.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--text-muted)] border-t-[var(--accent-current)] animate-spin" />
            </div>
        );
    }

    if (validators.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-xs text-[var(--text-muted)]">No validator data</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {/* Nakamoto note */}
            {nakamotoCoeff > 0 && (
                <div className="flex items-center gap-1.5 px-2 pb-2 border-b border-[var(--panel-border)]">
                    <AlertTriangle size={10} className="text-[var(--warning)] shrink-0" />
                    <span className="text-[10px] text-[var(--text-muted)]">
                        Nakamoto coeff:{' '}
                        <span className="text-[var(--warning)] mono font-semibold">{nakamotoCoeff}</span>
                        <span className="text-[var(--text-muted)]"> — validators to control 33% stake</span>
                    </span>
                </div>
            )}

            {/* Table header */}
            <div className="grid grid-cols-[24px_1fr_70px_50px_40px] gap-2 px-2 py-1.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--panel-border)]">
                <span>#</span>
                <span>Identity</span>
                <span className="text-right">Stake</span>
                <span className="text-right">%</span>
                <span className="text-right">Fee</span>
            </div>

            {/* Rows */}
            <div className="flex flex-col max-h-[380px] overflow-y-auto">
                {validators.map((v, i) => (
                    <div
                        key={v.votePubkey}
                        className="grid grid-cols-[24px_1fr_70px_50px_40px] gap-2 items-center px-2 py-2 hover:bg-[var(--bg-hover)] transition-colors rounded-md"
                    >
                        {/* Rank */}
                        <span className="text-[10px] text-[var(--text-muted)] mono">{i + 1}</span>

                        {/* Identity */}
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs mono text-[var(--text-primary)] truncate">
                                {truncateAddress(v.nodePubkey)}
                            </span>
                            {v.isDelinquent && (
                                <span className="text-[9px] text-[var(--negative)] font-semibold">DELINQUENT</span>
                            )}
                        </div>

                        {/* Stake (in SOL) */}
                        <span
                            className={cn(
                                'text-xs mono text-right tabular-nums',
                                i < 3 ? 'text-[var(--accent-current)]' : 'text-[var(--text-secondary)]'
                            )}
                        >
                            {formatSol(v.activatedStake)}◎
                        </span>

                        {/* Stake % */}
                        <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[10px] mono text-[var(--text-secondary)] tabular-nums">
                                {v.stakePercent.toFixed(2)}%
                            </span>
                            {/* Mini bar */}
                            <div className="w-full h-0.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--accent-current)] rounded-full"
                                    style={{ width: `${Math.min(v.stakePercent * 5, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Commission */}
                        <span className="text-[10px] mono text-right text-[var(--text-muted)] tabular-nums">
                            {v.commission}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
