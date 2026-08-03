export const ASCII_LOGO_SAMPLE_SIZE = 96

export const ASCII_LOGO_PALETTES = {
  site: ['#8464ff', '#f1f0eb', '#b9ff39'],
  blue: ['#0b1c54', '#2452b9', '#4b7cff'],
  mono: ['#555552', '#a7a7a2', '#f1f0eb'],
} as const

export function randomFor(index: number) {
  const value = Math.sin(index * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

export function isLogoPixel(red: number, green: number, blue: number) {
  return blue > 70 && blue > red * 1.25 && blue > green * 1.12
}
