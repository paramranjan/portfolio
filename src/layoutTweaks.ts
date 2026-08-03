export const portfolioLayoutOptions = [
  { value: 'current', label: 'Current' },
  { value: 'studio-split', label: 'Split studio' },
] as const

export type PortfolioLayout =
  (typeof portfolioLayoutOptions)[number]['value']

export function normalizePortfolioLayout(
  value: string | null,
): PortfolioLayout {
  return portfolioLayoutOptions.some((option) => option.value === value)
    ? (value as PortfolioLayout)
    : 'current'
}
