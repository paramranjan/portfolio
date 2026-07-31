export const ASCII_SCALE_MIN = 60
export const ASCII_SCALE_MAX = 130
export const ASCII_SCALE_DEFAULT = 100

export const ASCII_DENSITY_MIN = 1
export const ASCII_DENSITY_MAX = 4
export const ASCII_DENSITY_DEFAULT = 4

export const ASCII_DEPTH_MIN = 0
export const ASCII_DEPTH_MAX = 30
export const ASCII_DEPTH_DEFAULT = 13

export const ASCII_TILT_MIN = -30
export const ASCII_TILT_MAX = 30
export const ASCII_TILT_DEFAULT = -7

export const ASCII_DURATION_MIN = 1200
export const ASCII_DURATION_MAX = 5000
export const ASCII_DURATION_DEFAULT = 2600

export const ASCII_START_ROTATION_MIN = -180
export const ASCII_START_ROTATION_MAX = 180
export const ASCII_START_ROTATION_DEFAULT = 0

export const ASCII_ROTATION_END_MIN = 30
export const ASCII_ROTATION_END_MAX = 100
export const ASCII_ROTATION_END_DEFAULT = 30

export const ASCII_ASSEMBLY_END_MIN = 30
export const ASCII_ASSEMBLY_END_MAX = 100
export const ASCII_ASSEMBLY_END_DEFAULT = 64

export const ASCII_REVEAL_DURATION_MIN = 20
export const ASCII_REVEAL_DURATION_MAX = 80
export const ASCII_REVEAL_DURATION_DEFAULT = 27

export const ASCII_TRAVEL_DURATION_MIN = 200
export const ASCII_TRAVEL_DURATION_MAX = 1800
export const ASCII_TRAVEL_DURATION_DEFAULT = 800

export const ASCII_COPY_DELAY_MIN = 0
export const ASCII_COPY_DELAY_MAX = 1500
export const ASCII_COPY_DELAY_DEFAULT = 200

export const ASCII_COPY_RISE_MIN = 0
export const ASCII_COPY_RISE_MAX = 200
export const ASCII_COPY_RISE_DEFAULT = 37

export const ASCII_COPY_DURATION_MIN = 200
export const ASCII_COPY_DURATION_MAX = 1800
export const ASCII_COPY_DURATION_DEFAULT = 600

export const ASCII_PLAY_INTENSITY_MIN = 0
export const ASCII_PLAY_INTENSITY_MAX = 100
export const ASCII_PLAY_INTENSITY_DEFAULT = 19

export const ASCII_PLAY_SPEED_MIN = 25
export const ASCII_PLAY_SPEED_MAX = 200
export const ASCII_PLAY_SPEED_DEFAULT = 140

export const ASCII_REST_STATE_DEFAULT = false

export const asciiPalettes = [
  { value: 'site', label: 'Site' },
  { value: 'blue', label: 'Blue' },
  { value: 'mono', label: 'Mono' },
] as const

export type AsciiPalette = (typeof asciiPalettes)[number]['value']

export const asciiEasings = [
  { value: 'linear', label: 'Linear', css: 'linear' },
  { value: 'smooth', label: 'Smooth', css: 'cubic-bezier(0.65, 0, 0.35, 1)' },
  { value: 'out', label: 'Ease out', css: 'cubic-bezier(0.22, 1, 0.36, 1)' },
] as const

export type AsciiEasing = (typeof asciiEasings)[number]['value']

function normalizeInteger(
  value: string | null,
  defaultValue: number,
  minimum: number,
  maximum: number,
) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return defaultValue

  return Math.min(Math.max(Math.round(parsed), minimum), maximum)
}

export function normalizeAsciiScale(value: string | null) {
  return normalizeInteger(
    value,
    ASCII_SCALE_DEFAULT,
    ASCII_SCALE_MIN,
    ASCII_SCALE_MAX,
  )
}

export function normalizeAsciiDensity(value: string | null) {
  return normalizeInteger(
    value,
    ASCII_DENSITY_DEFAULT,
    ASCII_DENSITY_MIN,
    ASCII_DENSITY_MAX,
  )
}

export function normalizeAsciiDepth(value: string | null) {
  return normalizeInteger(
    value,
    ASCII_DEPTH_DEFAULT,
    ASCII_DEPTH_MIN,
    ASCII_DEPTH_MAX,
  )
}

export function normalizeAsciiTilt(value: string | null) {
  return normalizeInteger(
    value,
    ASCII_TILT_DEFAULT,
    ASCII_TILT_MIN,
    ASCII_TILT_MAX,
  )
}

export function normalizeAsciiDuration(value: string | null) {
  return normalizeInteger(
    value,
    ASCII_DURATION_DEFAULT,
    ASCII_DURATION_MIN,
    ASCII_DURATION_MAX,
  )
}

export function normalizeAsciiStartRotation(value: string | null) {
  return normalizeInteger(
    value,
    ASCII_START_ROTATION_DEFAULT,
    ASCII_START_ROTATION_MIN,
    ASCII_START_ROTATION_MAX,
  )
}

export function normalizeAsciiRotationEnd(value: string | null) {
  return normalizeInteger(
    value,
    ASCII_ROTATION_END_DEFAULT,
    ASCII_ROTATION_END_MIN,
    ASCII_ROTATION_END_MAX,
  )
}

export function normalizeAsciiAssemblyEnd(value: string | null) {
  return normalizeInteger(
    value,
    ASCII_ASSEMBLY_END_DEFAULT,
    ASCII_ASSEMBLY_END_MIN,
    ASCII_ASSEMBLY_END_MAX,
  )
}

export function normalizeAsciiRevealDuration(value: string | null) {
  return normalizeInteger(
    value,
    ASCII_REVEAL_DURATION_DEFAULT,
    ASCII_REVEAL_DURATION_MIN,
    ASCII_REVEAL_DURATION_MAX,
  )
}

export function normalizeAsciiTravelDuration(value: string | null) {
  return normalizeInteger(
    value,
    ASCII_TRAVEL_DURATION_DEFAULT,
    ASCII_TRAVEL_DURATION_MIN,
    ASCII_TRAVEL_DURATION_MAX,
  )
}

export function normalizeAsciiCopyDelay(value: string | null) {
  return normalizeInteger(
    value,
    ASCII_COPY_DELAY_DEFAULT,
    ASCII_COPY_DELAY_MIN,
    ASCII_COPY_DELAY_MAX,
  )
}

export function normalizeAsciiCopyRise(value: string | null) {
  return normalizeInteger(
    value,
    ASCII_COPY_RISE_DEFAULT,
    ASCII_COPY_RISE_MIN,
    ASCII_COPY_RISE_MAX,
  )
}

export function normalizeAsciiCopyDuration(value: string | null) {
  return normalizeInteger(
    value,
    ASCII_COPY_DURATION_DEFAULT,
    ASCII_COPY_DURATION_MIN,
    ASCII_COPY_DURATION_MAX,
  )
}

export function normalizeAsciiPlayIntensity(value: string | null) {
  return normalizeInteger(
    value,
    ASCII_PLAY_INTENSITY_DEFAULT,
    ASCII_PLAY_INTENSITY_MIN,
    ASCII_PLAY_INTENSITY_MAX,
  )
}

export function normalizeAsciiPlaySpeed(value: string | null) {
  return normalizeInteger(
    value,
    ASCII_PLAY_SPEED_DEFAULT,
    ASCII_PLAY_SPEED_MIN,
    ASCII_PLAY_SPEED_MAX,
  )
}

export function normalizeAsciiRestState(value: string | null) {
  return value === 'true'
}

export function normalizeAsciiPalette(value: string | null): AsciiPalette {
  return asciiPalettes.some((palette) => palette.value === value)
    ? (value as AsciiPalette)
    : 'site'
}

export function normalizeAsciiEasing(value: string | null): AsciiEasing {
  return asciiEasings.some((easing) => easing.value === value)
    ? (value as AsciiEasing)
    : 'out'
}

export function getAsciiEasingCss(easing: AsciiEasing) {
  return (
    asciiEasings.find((option) => option.value === easing) ?? asciiEasings[1]
  ).css
}
