export const HERO_FONT_SIZE_MIN = 48
export const HERO_FONT_SIZE_MAX = 140
export const HERO_FONT_SIZE_DEFAULT = 100

export const heroFonts = [
  {
    value: 'pp-mori',
    label: 'PP Mori',
    family: "'PP Mori', Arial, sans-serif",
  },
  {
    value: 'pp-mondwest',
    label: 'PP Mondwest',
    family: "'PP Mondwest', 'PP Mori', Arial, sans-serif",
  },
  {
    value: 'pp-neue-bit',
    label: 'PP NeueBit',
    family: "'PP NeueBit', 'PP Mori', Arial, sans-serif",
  },
] as const

export type HeroAlignment = 'left' | 'center'
export type HeroFont = (typeof heroFonts)[number]['value']

export function normalizeHeroAlignment(
  value: string | null,
): HeroAlignment {
  return value === 'center' ? 'center' : 'left'
}

export function normalizeHeroFont(value: string | null): HeroFont {
  return heroFonts.some((font) => font.value === value)
    ? (value as HeroFont)
    : 'pp-mori'
}

export function normalizeHeroFontSize(value: string | null) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return HERO_FONT_SIZE_DEFAULT

  return Math.min(
    Math.max(Math.round(parsed), HERO_FONT_SIZE_MIN),
    HERO_FONT_SIZE_MAX,
  )
}

export function getMobileHeroFontSize(fontSize: number) {
  const progress =
    (fontSize - HERO_FONT_SIZE_MIN) /
    (HERO_FONT_SIZE_MAX - HERO_FONT_SIZE_MIN)

  return Math.round((44 + progress * 42) * 10) / 10
}
