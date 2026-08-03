export const headerTitleOptions = [
  { value: 'prm-rnjn', label: 'PRM RNJN', text: 'PRM RNJN' },
  { value: 'param', label: 'param', text: 'param' },
] as const

export type HeaderTitle = (typeof headerTitleOptions)[number]['value']

export const headerMarkOptions = [
  { value: 'micro-pr', label: 'Micro PR' },
  { value: 'full-logo', label: 'Full logo' },
] as const

export type HeaderMark = (typeof headerMarkOptions)[number]['value']

export const HEADER_ASCII_REVEAL_DELAY_MIN = 0
export const HEADER_ASCII_REVEAL_DELAY_MAX = 1000
export const HEADER_ASCII_REVEAL_DELAY_DEFAULT = 300
export const HEADER_ASCII_DENSITY_DEFAULT = 2

export function normalizeHeaderTitle(value: string | null): HeaderTitle {
  return headerTitleOptions.some((option) => option.value === value)
    ? (value as HeaderTitle)
    : 'prm-rnjn'
}

export function normalizeHeaderMark(value: string | null): HeaderMark {
  return headerMarkOptions.some((option) => option.value === value)
    ? (value as HeaderMark)
    : 'micro-pr'
}

function normalizeInteger(
  value: string | null,
  defaultValue: number,
  minimum: number,
  maximum: number,
) {
  if (value === null || value.trim() === '') return defaultValue

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return defaultValue

  return Math.min(Math.max(Math.round(parsed), minimum), maximum)
}

export function normalizeHeaderAsciiRevealDelay(value: string | null) {
  return normalizeInteger(
    value,
    HEADER_ASCII_REVEAL_DELAY_DEFAULT,
    HEADER_ASCII_REVEAL_DELAY_MIN,
    HEADER_ASCII_REVEAL_DELAY_MAX,
  )
}

export function normalizeHeaderAsciiDensity(value: string | null) {
  return normalizeInteger(value, HEADER_ASCII_DENSITY_DEFAULT, 1, 4)
}

export function getHeaderTitleText(value: HeaderTitle) {
  return (
    headerTitleOptions.find((option) => option.value === value) ??
    headerTitleOptions[0]
  ).text
}
