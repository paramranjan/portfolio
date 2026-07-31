export type MotionProfile = 'original' | 'improved'

export function normalizeMotionProfile(
  value: string | null,
): MotionProfile {
  return value === 'original' || value === 'improved'
    ? value
    : 'improved'
}
