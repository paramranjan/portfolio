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

export function getHeaderScrollProgress(scrollY: number) {
  return Math.min(Math.max((scrollY - 48) / 170, 0), 1)
}

export function getHeaderShapeProgress(progress: number) {
  return Math.min(Math.max((progress - 0.03) / 0.97, 0), 1)
}

export function smoothHeaderProgress(current: number, target: number) {
  const next = current + (target - current) * 0.32
  return Math.abs(target - next) < 0.001 ? target : next
}

export function getResponsiveHeaderProgress(
  current: number,
  target: number,
  previousTarget: number,
) {
  const remainingDistance = Math.abs(target - current)
  const reversedPastCurrent =
    (previousTarget - current) * (target - current) < 0

  if (reversedPastCurrent || remainingDistance >= 0.45) {
    return target
  }

  if (remainingDistance >= 0.18) {
    const next = current + (target - current) * 0.5
    return Math.abs(target - next) < 0.001 ? target : next
  }

  return smoothHeaderProgress(current, target)
}

export function getHeaderRenderKey(motionEnabled: boolean) {
  return motionEnabled ? 'motion' : 'static'
}
