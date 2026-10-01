export const statsKeys = {
  all: ['stats'] as const,
  dashboard: (mois?: string) => [...statsKeys.all, 'dashboard', mois ?? 'current'] as const,
  balance: (mois?: string) => [...statsKeys.all, 'balance', mois ?? 'current'] as const,
}
