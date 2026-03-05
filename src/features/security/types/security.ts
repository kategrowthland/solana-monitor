// ─── Security Alert Types ─────────────────────────────────────────

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'info';

export type RiskSignal =
    | 'honeypot'
    | 'mintable'
    | 'scam'
    | 'lp_not_burned'
    | 'insider_concentration'
    | 'new_token'
    | 'no_liquidity'
    | 'large_holder';

export interface SecurityAlert {
    id: string;
    address: string;
    tokenName: string;
    symbol: string;
    logoURI?: string;
    severity: AlertSeverity;
    signal: RiskSignal;
    detail: string;
    timestamp: number; // unix ms
}

export const SEVERITY_ORDER: Record<AlertSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    info: 3,
};

export const SIGNAL_LABELS: Record<RiskSignal, string> = {
    honeypot: 'Honeypot Suspected',
    mintable: 'Mintable Supply',
    scam: 'Flagged as Scam',
    lp_not_burned: 'LP Not Burned',
    insider_concentration: 'Insider Concentration',
    new_token: 'New Token Risk',
    no_liquidity: 'No Liquidity',
    large_holder: 'Large Holder Detected',
};
