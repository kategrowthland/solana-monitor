export type Variant = 'solana' | 'defi' | 'meme' | 'dev';

export interface VariantConfig {
  id: Variant;
  label: string;
  accentVar: string;
  accentColor: string;
}

export const VARIANTS: VariantConfig[] = [
  { id: 'solana', label: 'Solana', accentVar: '--accent-solana', accentColor: '#1098FF' },  // Insight Blue — analytics/data
  { id: 'defi',   label: 'DeFi',   accentVar: '--accent-defi',   accentColor: '#741EFF' },  // Future Violet — vision/strategy
  { id: 'meme',   label: 'Meme',   accentVar: '--accent-meme',   accentColor: '#FF5E00' },  // Impact Orange — community/social
  { id: 'dev',    label: 'Dev',    accentVar: '--accent-dev',    accentColor: '#3ECF00' },  // Growth Green — R&D/strategy
];

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface PriceData {
  value: number;
  updateUnixTime: number;
  updateHumanTime: string;
}

export interface TokenOverview {
  address: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
  logoURI?: string;
}
