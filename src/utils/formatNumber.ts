const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const preciseFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

export const formatCompact = (value: number): string =>
  compactFormatter.format(value);

export const formatUsd = (value: number): string =>
  currencyFormatter.format(value);

export const formatPrice = (value: number): string => {
  if (value >= 1) return formatUsd(value);
  return `$${preciseFormatter.format(value)}`;
};

export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};
