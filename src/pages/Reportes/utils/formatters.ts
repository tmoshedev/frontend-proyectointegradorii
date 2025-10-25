export const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export const formatPercentOneDecimal = (value: number | null | undefined) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toFixed(1);
  }
  return '0.0';
};

export const formatInteger = (value: number | null | undefined) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toLocaleString('es-PE');
  }
  return '0';
};

export const computeNiceTickStep = (maxValue: number): number => {
  if (!Number.isFinite(maxValue) || maxValue <= 0) {
    return 1;
  }

  const rawStep = Math.ceil(maxValue / 6);
  const exponent = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / exponent;

  let niceNormalized: number;
  if (normalized <= 1) niceNormalized = 1;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 5) niceNormalized = 5;
  else niceNormalized = 10;

  const step = niceNormalized * exponent;
  return Math.max(1, step);
};

export const RANKING_COLOR_PALETTE = [
  '#2563eb',
  '#10b981',
  '#f97316',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#8b5cf6',
  '#0ea5e9',
];

export const getRankingStateColor = (index: number, color?: string) => {
  if (typeof color === 'string' && color.trim().length > 0) {
    return color;
  }
  return RANKING_COLOR_PALETTE[index % RANKING_COLOR_PALETTE.length];
};
