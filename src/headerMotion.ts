export function getHeaderMorphLayout(viewportWidth: number) {
  const pagePadding = Math.min(Math.max(viewportWidth * 0.03, 20), 48)
  const floatingWidth = Math.min(680, viewportWidth - 36)

  return {
    pagePadding,
    floatingInset: Math.max((viewportWidth - floatingWidth) / 2, 18),
  }
}

export function isHeaderMorphEnabled(
  viewportWidth: number,
  shouldReduceMotion: boolean | null,
) {
  return viewportWidth > 720 && !shouldReduceMotion
}

export function smoothHeaderProgress(current: number, target: number) {
  const next = current + (target - current) * 0.16
  return Math.abs(target - next) < 0.001 ? target : next
}

export function getHeaderRenderKey(motionEnabled: boolean) {
  return motionEnabled ? 'motion' : 'static'
}
