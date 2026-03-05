import { useQuery } from '@tanstack/react-query';
import { getMemeTokens, getTokenSecurity } from '@/lib/api/birdeye';
import type { SecurityAlert, AlertSeverity, RiskSignal } from '../types/security';
import { SEVERITY_ORDER } from '../types/security';

const REFETCH_INTERVAL_MS = 60_000; // 1 min — security calls are expensive

// ─── Risk evaluator ───────────────────────────────────────────────

interface TokenBase {
    address: string;
    name: string;
    symbol: string;
    logo_uri?: string;
    logoURI?: string;
    creation_time?: number;
    volume_24h_usd?: number;
    liquidity?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const evalSecurity = (token: TokenBase, sec: any): SecurityAlert[] => {
    const alerts: SecurityAlert[] = [];
    const now = Date.now();
    const base = {
        address: token.address,
        tokenName: token.name ?? token.symbol ?? '',
        symbol: token.symbol ?? '???',
        logoURI: token.logo_uri ?? token.logoURI,
        timestamp: now,
    };

    // Helper to push an alert
    const push = (
        signal: RiskSignal,
        severity: AlertSeverity,
        detail: string
    ) =>
        alerts.push({
            id: `${token.address}-${signal}`,
            ...base,
            signal,
            severity,
            detail,
        });

    if (!sec) {
        // Token has no security data and very low liquidity
        if ((token.liquidity ?? 0) < 1_000) {
            push('no_liquidity', 'high', 'Liquidity below $1K — exercise caution');
        }
        return alerts;
    }

    if (sec.is_honeypot === true || sec.honeypot === true) {
        push('honeypot', 'critical', 'Contract flagged as honeypot — cannot sell');
    }
    if (sec.is_scam === true || sec.scam === true) {
        push('scam', 'critical', 'Token flagged as scam/rug by security scanner');
    }
    if (sec.mintable === true || sec.mutable_metadata === true) {
        push('mintable', 'high', 'Contract owner can mint unlimited supply');
    }

    const lpBurned = sec.lp_burned_percent ?? sec.lpBurnedPercent ?? null;
    if (lpBurned !== null && lpBurned < 80) {
        push(
            'lp_not_burned',
            'medium',
            `Only ${lpBurned.toFixed(0)}% of LP tokens burned — rug risk`
        );
    }

    const top10Pct = sec.top_10_holder_percent ?? sec.top10HolderPercent ?? null;
    if (top10Pct !== null && top10Pct > 60) {
        push(
            'insider_concentration',
            'medium',
            `Top 10 holders own ${top10Pct.toFixed(0)}% of supply`
        );
    }

    const createdAt = token.creation_time ?? 0;
    if (createdAt > 0) {
        const ageH = (Date.now() / 1000 - createdAt) / 3600;
        if (ageH < 24) {
            push('new_token', 'info', `Token is only ${ageH.toFixed(1)}h old — DYOR`);
        }
    }

    return alerts;
};

// ─── Hook ─────────────────────────────────────────────────────────

export const useSecurityAlerts = () => {
    return useQuery<SecurityAlert[]>({
        queryKey: ['security', 'alerts'],
        queryFn: async () => {
            // Step 1: fetch recently created meme tokens — far more likely to have security issues
            // than established trending tokens like BONK/JUP which are always clean
            const raw = await getMemeTokens('creation_time', 'desc', 20);
            const items: TokenBase[] = Array.isArray(raw?.items)
                ? raw.items
                : Array.isArray(raw)
                    ? raw
                    : [];

            // Step 2: fetch security data for each token with a small delay to avoid rate limiting
            const allAlerts: SecurityAlert[] = [];
            const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

            for (let i = 0; i < items.length; i++) {
                const token = items[i];
                if (!token.address) continue;
                try {
                    const sec = await getTokenSecurity(token.address);
                    const alerts = evalSecurity(token, sec);
                    allAlerts.push(...alerts);
                } catch {
                    // Ignore individual token failures
                }
                // 200ms gap between requests
                if (i < items.length - 1) await delay(200);
            }

            // Sort by severity then timestamp (newest first within same severity)
            return allAlerts.sort(
                (a, b) =>
                    SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
                    b.timestamp - a.timestamp
            );
        },
        refetchInterval: REFETCH_INTERVAL_MS,
        staleTime: 30_000,
    });
};
