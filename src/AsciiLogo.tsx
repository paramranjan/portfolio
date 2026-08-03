import { useEffect, useRef } from 'react'
import type {
  AsciiCameraResponse,
  AsciiPalette,
} from './asciiTweaks.ts'
import {
  ASCII_LOGO_PALETTES,
  ASCII_LOGO_SAMPLE_SIZE,
  isLogoPixel,
  randomFor,
} from './asciiLogoSource.ts'

const GLYPHS = ['·', ':', '+', '*', '#', '@']
const REST_MONO_COLORS = ['#deded8', '#f0efe9', '#ffffff'] as const
const REST_IDLE_DELAY = 2400
const REST_ENTER_DURATION = 1200
const REST_EXIT_DURATION = 220
const REST_BREATH_PERIOD = 8000
const REST_GLYPH_BRIGHTNESS_MIN = 0.1
const REST_GLYPH_BRIGHTNESS_RANGE = 0.38
const REST_GLYPH_PULSE_MIN = 0.015
const REST_GLYPH_PULSE_RANGE = 0.04
const REST_SPARKLE_THRESHOLD = 0.82
const REST_SPARKLE_POWER = 14
const CAMERA_MAX_YAW = (6 * Math.PI) / 180
const CAMERA_MAX_PITCH = (4 * Math.PI) / 180
const CAMERA_DAMPING = 12
const CAMERA_SETTLE_THRESHOLD = 0.001

type AsciiLogoProps = {
  scale: number
  density: number
  depth: number
  tilt: number
  duration: number
  palette: AsciiPalette
  startRotation: number
  rotationEnd: number
  assemblyEnd: number
  revealDuration: number
  easing: 'linear' | 'smooth' | 'out'
  playIntensity: number
  playSpeed: number
  restMode: boolean
  cameraResponse: AsciiCameraResponse
  restStartDelay: number
  optimized: boolean
  reducedMotion: boolean
  onReady?: () => void
  onComplete?: () => void
}

type LifecycleFallback = () => void

type LogoPoint = {
  x: number
  y: number
  z: number
  scatterX: number
  scatterY: number
  scatterZ: number
  delay: number
  glyph: string
  layer: number
  restBrightness: number
  restPulse: number
  restPhase: number
  restSparkle: number
  restSparkleSpeed: number
}

type RestFrame = {
  amount: number
  scale: number
  opacity: number
  phase: number
}

type ProjectedPoint = LogoPoint & {
  pointIndex: number
  drawX: number
  drawY: number
  depth: number
  alpha: number
}

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1)
}

function mix(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

function mixHexColor(from: string, to: string, progress: number) {
  const fromValue = Number.parseInt(from.slice(1), 16)
  const toValue = Number.parseInt(to.slice(1), 16)
  const channel = (value: number, shift: number) => (value >> shift) & 255
  const red = Math.round(
    mix(channel(fromValue, 16), channel(toValue, 16), progress),
  )
  const green = Math.round(
    mix(channel(fromValue, 8), channel(toValue, 8), progress),
  )
  const blue = Math.round(
    mix(channel(fromValue, 0), channel(toValue, 0), progress),
  )

  return `rgb(${red} ${green} ${blue})`
}

function getRestGlyphBrightness(point: LogoPoint, restFrame: RestFrame) {
  const phase =
    restFrame.phase * point.restSparkleSpeed + point.restPhase
  const pulse = Math.sin(phase) * point.restPulse
  const sparkleWave = Math.max(Math.sin(phase), 0)
  const sparkle =
    sparkleWave ** REST_SPARKLE_POWER * point.restSparkle
  const restingBrightness = clamp(
    point.restBrightness + pulse + sparkle,
  )

  return mix(1, restingBrightness, restFrame.amount)
}

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value ** 3
    : 1 - ((-2 * value + 2) ** 3) / 2
}

function applyEasing(value: number, easing: AsciiLogoProps['easing']) {
  if (easing === 'linear') return value
  return easing === 'out' ? easeOutCubic(value) : easeInOutCubic(value)
}

function createLogoPoints(
  image: HTMLImageElement,
  sampleStep: number,
  depth: number,
) {
  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = ASCII_LOGO_SAMPLE_SIZE
  sourceCanvas.height = ASCII_LOGO_SAMPLE_SIZE

  const sourceContext = sourceCanvas.getContext('2d', {
    willReadFrequently: true,
  })
  if (!sourceContext) return []

  sourceContext.drawImage(
    image,
    0,
    0,
    ASCII_LOGO_SAMPLE_SIZE,
    ASCII_LOGO_SAMPLE_SIZE,
  )
  const pixels = sourceContext.getImageData(
    0,
    0,
    ASCII_LOGO_SAMPLE_SIZE,
    ASCII_LOGO_SAMPLE_SIZE,
  ).data
  const sourcePoints: Array<{ x: number; y: number }> = []

  for (let y = 0; y < ASCII_LOGO_SAMPLE_SIZE; y += sampleStep) {
    for (let x = 0; x < ASCII_LOGO_SAMPLE_SIZE; x += sampleStep) {
      const pixelIndex = (y * ASCII_LOGO_SAMPLE_SIZE + x) * 4
      if (
        isLogoPixel(
          pixels[pixelIndex],
          pixels[pixelIndex + 1],
          pixels[pixelIndex + 2],
        )
      ) {
        sourcePoints.push({ x, y })
      }
    }
  }

  if (sourcePoints.length === 0) return []

  const xs = sourcePoints.map((point) => point.x)
  const ys = sourcePoints.map((point) => point.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const halfWidth = Math.max((maxX - minX) / 2, 1)
  const points: LogoPoint[] = []

  sourcePoints.forEach((point, pointIndex) => {
    for (let layer = 0; layer < 3; layer += 1) {
      const index = pointIndex * 3 + layer
      points.push({
        x: (point.x - centerX) / halfWidth,
        y: (point.y - centerY) / halfWidth,
        z: (layer - 1) * depth,
        scatterX: (randomFor(index + 11) - 0.5) * 2.5,
        scatterY: (randomFor(index + 37) - 0.5) * 1.7,
        scatterZ: (randomFor(index + 71) - 0.5) * 2.4,
        delay: randomFor(index + 103) * 0.18,
        glyph: GLYPHS[Math.floor(randomFor(index + 149) * GLYPHS.length)],
        layer,
        restBrightness:
          REST_GLYPH_BRIGHTNESS_MIN +
          randomFor(index + 173) * REST_GLYPH_BRIGHTNESS_RANGE,
        restPulse:
          REST_GLYPH_PULSE_MIN +
          randomFor(index + 197) * REST_GLYPH_PULSE_RANGE,
        restPhase: randomFor(index + 223) * Math.PI * 2,
        restSparkle:
          randomFor(index + 251) > REST_SPARKLE_THRESHOLD
            ? 0.58 + randomFor(index + 277) * 0.34
            : 0.03 + randomFor(index + 307) * 0.07,
        restSparkleSpeed: 0.7 + randomFor(index + 331) * 0.6,
      })
    }
  })

  return points
}

export function AsciiLogo({
  scale,
  density,
  depth,
  tilt,
  duration,
  palette,
  startRotation,
  rotationEnd,
  assemblyEnd,
  revealDuration,
  easing,
  playIntensity,
  playSpeed,
  restMode,
  cameraResponse,
  restStartDelay,
  optimized,
  reducedMotion,
  onReady,
  onComplete,
}: AsciiLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onReadyRef = useRef(onReady)
  const onCompleteRef = useRef(onComplete)
  const readyNotifiedRef = useRef(false)
  const completeNotifiedRef = useRef(false)
  const previousOptimizedReducedMotionRef = useRef<boolean | undefined>(
    undefined,
  )
  const restModeRef = useRef(restMode)
  const restStartDelayRef = useRef(restStartDelay)
  const restReducedMotionRef = useRef(reducedMotion)
  const requestDrawRef = useRef<() => void>(() => {})
  const optimizedReducedMotion = optimized ? reducedMotion : undefined

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    restModeRef.current = restMode
    requestDrawRef.current()
  }, [restMode])

  useEffect(() => {
    restStartDelayRef.current = restStartDelay
    requestDrawRef.current()
  }, [restStartDelay])

  useEffect(() => {
    restReducedMotionRef.current = reducedMotion
    requestDrawRef.current()
  }, [reducedMotion])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const rendererReducedMotion = optimized
      ? optimizedReducedMotion === true
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const resumeSettledAnimation =
      optimized &&
      previousOptimizedReducedMotionRef.current === true &&
      !rendererReducedMotion

    previousOptimizedReducedMotionRef.current = optimized
      ? rendererReducedMotion
      : undefined

    const image = new Image()
    let frame = 0
    let disposed = false
    let points: LogoPoint[] = []
    const sampleStep = 5 - density
    const layerColors = ASCII_LOGO_PALETTES[palette]
    const restColors = REST_MONO_COLORS
    let lastActivityTime = performance.now()
    let lastRestFrameTime = 0
    let restBreathStartTime = lastActivityTime
    let resting = false
    let restAmount = 0
    let restIdleTimer = 0
    let restEligibleAt = Number.POSITIVE_INFINITY
    let scheduleRestIdleDraw = () => {}
    let restPausedAt = 0
    let activityDuringPause = false

    const getRestActivityOrigin = () =>
      Math.max(lastActivityTime, restEligibleAt)

    const pauseRestClock = () => {
      if (restPausedAt === 0) restPausedAt = performance.now()
      window.clearTimeout(restIdleTimer)
      restIdleTimer = 0
      lastRestFrameTime = 0
    }

    const resumeRestClock = () => {
      if (restPausedAt === 0) return 0

      const pausedDuration = performance.now() - restPausedAt
      restPausedAt = 0
      lastActivityTime = activityDuringPause
        ? performance.now()
        : lastActivityTime + pausedDuration
      activityDuringPause = false
      if (Number.isFinite(restEligibleAt)) {
        restEligibleAt += pausedDuration
      }
      restBreathStartTime += pausedDuration
      lastRestFrameTime = 0
      scheduleRestIdleDraw()
      return pausedDuration
    }

    const getRestFrame = (timestamp: number, progress: number) => {
      if (progress < 1) {
        restAmount = 0
        lastRestFrameTime = timestamp
        return { amount: 0, scale: 1, opacity: 1, phase: 0 }
      }

      if (!Number.isFinite(restEligibleAt)) {
        restEligibleAt =
          timestamp +
          (restReducedMotionRef.current
            ? 0
            : restStartDelayRef.current)
        lastActivityTime = Math.max(lastActivityTime, restEligibleAt)
        scheduleRestIdleDraw()
      }

      const restActivityOrigin = getRestActivityOrigin()
      if (restReducedMotionRef.current) {
        restAmount =
          restModeRef.current &&
          timestamp - restActivityOrigin >= REST_IDLE_DELAY
            ? 1
            : 0
        return { amount: restAmount, scale: 1, opacity: 1, phase: 0 }
      }

      const shouldRest =
        restModeRef.current &&
        timestamp - restActivityOrigin >= REST_IDLE_DELAY
      if (shouldRest && !resting) {
        resting = true
        restBreathStartTime = timestamp
      } else if (!shouldRest) {
        resting = false
      }
      const frameDelta =
        lastRestFrameTime === 0 ? 0 : timestamp - lastRestFrameTime
      lastRestFrameTime = timestamp
      const transitionDuration = shouldRest
        ? REST_ENTER_DURATION
        : REST_EXIT_DURATION
      restAmount = clamp(
        restAmount +
          (shouldRest ? 1 : -1) * (frameDelta / transitionDuration),
      )

      const breathPhase =
        ((timestamp - restBreathStartTime) /
          REST_BREATH_PERIOD) *
        Math.PI *
        2
      const breathWave = (Math.sin(breathPhase) + 1) / 2

      return {
        amount: restAmount,
        scale: 1 + (breathWave - 0.5) * 0.016 * restAmount,
        opacity: 1 - (1 - breathWave) * 0.06 * restAmount,
        phase: breathPhase,
      }
    }

    const notifyReady = () => {
      if (readyNotifiedRef.current) return
      readyNotifiedRef.current = true
      onReadyRef.current?.()
    }

    const notifyComplete = () => {
      if (completeNotifiedRef.current) return
      completeNotifiedRef.current = true
      onCompleteRef.current?.()
    }

    const completeWithoutLogo: LifecycleFallback = () => {
      if (disposed) return
      notifyReady()
      notifyComplete()
    }

    if (!optimized) {
      let startTime = 0
      let documentVisible = !document.hidden
      let intersecting = true

      const requestOriginalDraw = () => {
        if (
          frame === 0 &&
          points.length > 0 &&
          documentVisible &&
          intersecting
        ) {
          frame = window.requestAnimationFrame(draw)
        }
      }

      const pauseOriginalDrawing = () => {
        pauseRestClock()
        window.cancelAnimationFrame(frame)
        frame = 0
      }

      const resumeOriginalDrawing = () => {
        if (!documentVisible || !intersecting) return
        const pausedDuration = resumeRestClock()
        if (startTime !== 0) startTime += pausedDuration
        requestOriginalDraw()
      }

      const resizeCanvas = () => {
        const bounds = canvas.getBoundingClientRect()
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
        const width = Math.max(Math.round(bounds.width * pixelRatio), 1)
        const height = Math.max(Math.round(bounds.height * pixelRatio), 1)

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width
          canvas.height = height
        }

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
        return bounds
      }

      const draw = (timestamp: number) => {
        frame = 0
        if (disposed || points.length === 0) return
        if (startTime === 0) startTime = timestamp

        const bounds = resizeCanvas()
        const elapsed = restReducedMotionRef.current
          ? duration
          : timestamp - startTime
        const progress = clamp(elapsed / duration)
        const idleTime =
          (Math.max(elapsed - duration, 0) / 1000) * (playSpeed / 100)
        const playAmount = restReducedMotionRef.current
          ? 0
          : playIntensity / 100
        const rotationProgress = applyEasing(
          clamp((progress - 0.05) / (rotationEnd / 100 - 0.05)),
          easing,
        )
        const settleProgress = applyEasing(
          clamp((progress - 0.02) / (assemblyEnd / 100 - 0.02)),
          easing,
        )
        const angleY = mix(
          (startRotation * Math.PI) / 180,
          (tilt * Math.PI) / 180,
          rotationProgress,
        )
        const angleX = mix(0.32, 0.05, rotationProgress)

        const sinY = Math.sin(angleY)
        const cosY = Math.cos(angleY)
        const sinX = Math.sin(angleX)
        const cosX = Math.cos(angleX)
        const boundsWidth = bounds.width
        const boundsHeight = bounds.height
        const objectScale =
          Math.min(boundsWidth * 0.38, boundsHeight * 0.6) * scale
        const glyphSize = Math.max(5, objectScale * 0.0225 * sampleStep)
        const centerX = bounds.width / 2
        const centerY = bounds.height / 2
        const projectedPoints: ProjectedPoint[] = []
        const restFrame = getRestFrame(timestamp, progress)

        context.clearRect(0, 0, boundsWidth, boundsHeight)
        context.font = `${glyphSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
        context.textAlign = 'center'
        context.textBaseline = 'middle'

        points.forEach((point, pointIndex) => {
          const revealProgress = applyEasing(
            clamp((progress - point.delay) / (revealDuration / 100)),
            easing,
          )
          const x = mix(point.scatterX, point.x, settleProgress)
          const y = mix(point.scatterY, point.y, settleProgress)
          const z = mix(point.scatterZ, point.z, settleProgress)
          const rotatedX = x * cosY + z * sinY
          const rotatedZ = -x * sinY + z * cosY
          const rotatedY = y * cosX - rotatedZ * sinX
          const pointDepth = y * sinX + rotatedZ * cosX
          const perspective = 1.7 / (1.7 + pointDepth * 0.22)
          const baseDrawX =
            centerX +
            rotatedX * objectScale * restFrame.scale * perspective
          const baseDrawY =
            centerY +
            rotatedY * objectScale * restFrame.scale * perspective
          const rippleY =
            progress >= 1
              ? Math.sin(idleTime * 2.4 + point.x * 6 + point.y * 4) *
                objectScale *
                0.018 *
                playAmount *
                (1 - restFrame.amount)
              : 0

          projectedPoints.push({
            ...point,
            pointIndex,
            drawX: baseDrawX,
            drawY: baseDrawY + rippleY,
            depth: pointDepth,
            alpha: revealProgress,
          })
        })

        projectedPoints
          .sort((first, second) => first.depth - second.depth)
          .forEach((point) => {
            const layerOpacity =
              point.layer === 2 ? 1 : point.layer === 1 ? 0.7 : 0.5
            context.globalAlpha =
              point.alpha *
              layerOpacity *
              restFrame.opacity *
              getRestGlyphBrightness(point, restFrame)
            context.fillStyle = mixHexColor(
              layerColors[point.layer],
              restColors[point.layer],
              restFrame.amount,
            )
            context.fillText(point.glyph, point.drawX, point.drawY)
          })

        context.globalAlpha = 1

        if (restReducedMotionRef.current) notifyReady()
        if (progress >= 1) notifyComplete()

        if (
          progress < 1 ||
          (!restReducedMotionRef.current &&
            (playIntensity > 0 ||
              restModeRef.current ||
              restAmount > 0))
        ) {
          frame = window.requestAnimationFrame(draw)
        }
      }

      const handleActivity = () => {
        const activityTime = performance.now()
        if (restPausedAt !== 0) activityDuringPause = true
        lastActivityTime = Number.isFinite(restEligibleAt)
          ? Math.max(activityTime, restEligibleAt)
          : activityTime
        window.clearTimeout(restIdleTimer)
        const shouldRedrawNow =
          !restReducedMotionRef.current || restAmount > 0
        if (shouldRedrawNow) requestOriginalDraw()
        scheduleRestIdleDraw()
      }
      scheduleRestIdleDraw = () => {
        window.clearTimeout(restIdleTimer)
        if (
          restReducedMotionRef.current &&
          restModeRef.current &&
          Number.isFinite(restEligibleAt)
        ) {
          const delay = Math.max(
            getRestActivityOrigin() +
              REST_IDLE_DELAY -
              performance.now(),
            0,
          )
          restIdleTimer = window.setTimeout(() => {
            restIdleTimer = 0
            requestOriginalDraw()
          }, delay)
        }
      }
      window.addEventListener('pointermove', handleActivity, { passive: true })
      window.addEventListener('pointerdown', handleActivity, { passive: true })
      window.addEventListener('keydown', handleActivity)
      window.addEventListener('scroll', handleActivity, { passive: true })
      requestDrawRef.current = handleActivity
      handleActivity()

      const handleVisibilityChange = () => {
        documentVisible = !document.hidden
        if (!documentVisible) {
          pauseOriginalDrawing()
          return
        }

        resumeOriginalDrawing()
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)

      const intersectionObserver = new IntersectionObserver((entries) => {
        intersecting = entries[0]?.isIntersecting ?? false
        if (intersecting) {
          resumeOriginalDrawing()
        } else {
          pauseOriginalDrawing()
        }
      })
      intersectionObserver.observe(canvas)

      const handleImageLoad = () => {
        points = createLogoPoints(image, sampleStep, depth)
        if (points.length === 0) {
          completeWithoutLogo()
          return
        }
        if (!restReducedMotionRef.current) notifyReady()
        requestOriginalDraw()
      }
      const handleImageError = () => completeWithoutLogo()
      image.addEventListener('load', handleImageLoad)
      image.addEventListener('error', handleImageError)
      image.src = '/logo-ascii-source.jpg'

      const resizeObserver = new ResizeObserver(() => {
        if (points.length === 0) return
        startTime = restReducedMotionRef.current
          ? 1
          : performance.now() - duration
        window.cancelAnimationFrame(frame)
        frame = window.requestAnimationFrame(draw)
      })
      resizeObserver.observe(canvas)

      return () => {
        disposed = true
        window.cancelAnimationFrame(frame)
        image.removeEventListener('load', handleImageLoad)
        image.removeEventListener('error', handleImageError)
        resizeObserver.disconnect()
        intersectionObserver.disconnect()
        window.clearTimeout(restIdleTimer)
        window.removeEventListener('pointermove', handleActivity)
        window.removeEventListener('pointerdown', handleActivity)
        window.removeEventListener('keydown', handleActivity)
        window.removeEventListener('scroll', handleActivity)
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        )
        requestDrawRef.current = () => {}
      }
    }

    let bounds: { width: number; height: number } | null = null
    let animationElapsed = resumeSettledAnimation ? duration : 0
    let lastTimestamp = 0
    let documentVisible = !document.hidden
    let intersecting = true
    let settledOrder: number[] | null = null
    let cameraTargetYaw = 0
    let cameraTargetPitch = 0
    let cameraYaw = 0
    let cameraPitch = 0
    let draw: FrameRequestCallback = () => {}
    const cameraEnabled =
      cameraResponse === 'subtle' &&
      !rendererReducedMotion &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches

    const canRender = () =>
      !disposed &&
      documentVisible &&
      intersecting &&
      bounds !== null &&
      points.length > 0

    const requestDraw = () => {
      if (frame !== 0 || !canRender()) return
      frame = window.requestAnimationFrame(draw)
    }

    const pauseDrawing = () => {
      window.cancelAnimationFrame(frame)
      frame = 0
      lastTimestamp = 0
      pauseRestClock()
    }

    const resumeDrawing = () => {
      if (!documentVisible || !intersecting) return
      resumeRestClock()
      requestDraw()
    }

    draw = (timestamp: number) => {
      frame = 0
      if (!canRender() || !bounds) return

      let frameDeltaSeconds = 0
      if (lastTimestamp === 0) {
        lastTimestamp = timestamp
      } else {
        const frameDelta = timestamp - lastTimestamp
        frameDeltaSeconds = Math.min(frameDelta / 1000, 1 / 20)
        if (!rendererReducedMotion) animationElapsed += frameDelta
        lastTimestamp = timestamp
      }

      const elapsed = rendererReducedMotion ? duration : animationElapsed
      const progress = clamp(elapsed / duration)
      const idleTime =
        (Math.max(elapsed - duration, 0) / 1000) * (playSpeed / 100)
      const playAmount = restReducedMotionRef.current
        ? 0
        : playIntensity / 100
      const rotationProgress = applyEasing(
        clamp((progress - 0.05) / (rotationEnd / 100 - 0.05)),
        easing,
      )
      const settleProgress = applyEasing(
        clamp((progress - 0.02) / (assemblyEnd / 100 - 0.02)),
        easing,
      )
      if (cameraEnabled && frameDeltaSeconds > 0) {
        const damping =
          1 - Math.exp(-CAMERA_DAMPING * frameDeltaSeconds)
        cameraYaw += (cameraTargetYaw - cameraYaw) * damping
        cameraPitch += (cameraTargetPitch - cameraPitch) * damping
      }
      const cameraMoving =
        cameraEnabled &&
        (Math.abs(cameraTargetYaw - cameraYaw) >
          CAMERA_SETTLE_THRESHOLD ||
          Math.abs(cameraTargetPitch - cameraPitch) >
            CAMERA_SETTLE_THRESHOLD)
      if (cameraMoving) settledOrder = null
      const cameraEntrance = easeOutCubic(clamp((progress - 0.7) / 0.3))
      const angleY = mix(
        (startRotation * Math.PI) / 180,
        (tilt * Math.PI) / 180,
        rotationProgress,
      ) + cameraYaw * cameraEntrance
      const angleX =
        mix(0.32, 0.05, rotationProgress) +
        cameraPitch * cameraEntrance
      const sinY = Math.sin(angleY)
      const cosY = Math.cos(angleY)
      const sinX = Math.sin(angleX)
      const cosX = Math.cos(angleX)
      const boundsWidth = bounds.width
      const boundsHeight = bounds.height
      const objectScale =
        Math.min(boundsWidth * 0.38, boundsHeight * 0.6) * scale
      const glyphSize = Math.max(5, objectScale * 0.0225 * sampleStep)
      const centerX = boundsWidth / 2
      const centerY = boundsHeight / 2
      const projectedPoints: ProjectedPoint[] = []
      const pointOrder = settledOrder ?? points.map((_, index) => index)
      const restFrame = getRestFrame(timestamp, progress)

      context.clearRect(0, 0, boundsWidth, boundsHeight)
      context.font = `${glyphSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
      context.textAlign = 'center'
      context.textBaseline = 'middle'

      pointOrder.forEach((pointIndex) => {
        const point = points[pointIndex]
        const revealProgress = applyEasing(
          clamp((progress - point.delay) / (revealDuration / 100)),
          easing,
        )
        const x = mix(point.scatterX, point.x, settleProgress)
        const y = mix(point.scatterY, point.y, settleProgress)
        const z = mix(point.scatterZ, point.z, settleProgress)
        const rotatedX = x * cosY + z * sinY
        const rotatedZ = -x * sinY + z * cosY
        const rotatedY = y * cosX - rotatedZ * sinX
        const pointDepth = y * sinX + rotatedZ * cosX
        const perspective = 1.7 / (1.7 + pointDepth * 0.22)
        const baseDrawX =
          centerX +
          rotatedX * objectScale * restFrame.scale * perspective
        const baseDrawY =
          centerY +
          rotatedY * objectScale * restFrame.scale * perspective
        const rippleY =
          progress >= 1
            ? Math.sin(idleTime * 2.4 + point.x * 6 + point.y * 4) *
              objectScale *
              0.018 *
              playAmount *
              (1 - restFrame.amount)
            : 0

        projectedPoints.push({
          ...point,
          pointIndex,
          drawX: baseDrawX,
          drawY: baseDrawY + rippleY,
          depth: pointDepth,
          alpha: revealProgress,
        })
      })

      if (settledOrder === null) {
        projectedPoints.sort((first, second) => first.depth - second.depth)
        if (progress >= 1 && !cameraMoving) {
          settledOrder = projectedPoints.map((point) => point.pointIndex)
        }
      }

      projectedPoints.forEach((point) => {
        const layerOpacity =
          point.layer === 2 ? 1 : point.layer === 1 ? 0.7 : 0.5
        context.globalAlpha =
          point.alpha *
          layerOpacity *
          restFrame.opacity *
          getRestGlyphBrightness(point, restFrame)
        context.fillStyle = mixHexColor(
          layerColors[point.layer],
          restColors[point.layer],
          restFrame.amount,
        )
        context.fillText(point.glyph, point.drawX, point.drawY)
      })
      context.globalAlpha = 1

      if (rendererReducedMotion) notifyReady()
      if (progress >= 1) notifyComplete()

      if (
        progress < 1 ||
        cameraMoving ||
        (!restReducedMotionRef.current &&
          (playIntensity > 0 ||
            restModeRef.current ||
            restAmount > 0))
      ) {
        requestDraw()
      }
    }

    const handleCameraPointerMove = (event: PointerEvent) => {
      const canvasBounds = canvas.getBoundingClientRect()
      if (canvasBounds.width === 0 || canvasBounds.height === 0) return

      const normalizedX = clamp(
        (event.clientX - canvasBounds.left) / canvasBounds.width,
      ) * 2 - 1
      const normalizedY = clamp(
        (event.clientY - canvasBounds.top) / canvasBounds.height,
      ) * 2 - 1
      cameraTargetYaw = normalizedX * CAMERA_MAX_YAW
      cameraTargetPitch = normalizedY * -CAMERA_MAX_PITCH
      settledOrder = null
      requestDraw()
    }

    const handleCameraPointerLeave = () => {
      cameraTargetYaw = 0
      cameraTargetPitch = 0
      settledOrder = null
      requestDraw()
    }

    if (cameraEnabled) {
      canvas.addEventListener('pointermove', handleCameraPointerMove, {
        passive: true,
      })
      canvas.addEventListener('pointerleave', handleCameraPointerLeave)
    }

    const handleActivity = () => {
      const activityTime = performance.now()
      if (restPausedAt !== 0) activityDuringPause = true
      lastActivityTime = Number.isFinite(restEligibleAt)
        ? Math.max(activityTime, restEligibleAt)
        : activityTime
      window.clearTimeout(restIdleTimer)
      if (!restReducedMotionRef.current || restAmount > 0) {
        requestDraw()
      }
      scheduleRestIdleDraw()
    }
    scheduleRestIdleDraw = () => {
      window.clearTimeout(restIdleTimer)
      if (
        restReducedMotionRef.current &&
        restModeRef.current &&
        Number.isFinite(restEligibleAt)
      ) {
        const delay = Math.max(
          getRestActivityOrigin() +
            REST_IDLE_DELAY -
            performance.now(),
          0,
        )
        restIdleTimer = window.setTimeout(() => {
          restIdleTimer = 0
          requestDraw()
        }, delay)
      }
    }
    window.addEventListener('pointermove', handleActivity, { passive: true })
    window.addEventListener('pointerdown', handleActivity, { passive: true })
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('scroll', handleActivity, { passive: true })
    requestDrawRef.current = handleActivity
    handleActivity()

    const handleImageLoad = () => {
      points = createLogoPoints(image, sampleStep, depth)
      if (points.length === 0) {
        completeWithoutLogo()
        return
      }
      if (!rendererReducedMotion) notifyReady()
      requestDraw()
    }
    const handleImageError = () => completeWithoutLogo()
    image.addEventListener('load', handleImageLoad)
    image.addEventListener('error', handleImageError)
    image.src = '/logo-ascii-source.jpg'

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(
        Math.round(entry.contentRect.width * pixelRatio),
        1,
      )
      const height = Math.max(
        Math.round(entry.contentRect.height * pixelRatio),
        1,
      )
      bounds = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      requestDraw()
    })
    resizeObserver.observe(canvas)

    const intersectionObserver = new IntersectionObserver((entries) => {
      intersecting = entries[0]?.isIntersecting ?? false
      if (intersecting) {
        resumeDrawing()
      } else {
        pauseDrawing()
      }
    })
    intersectionObserver.observe(canvas)

    const handleVisibilityChange = () => {
      documentVisible = !document.hidden
      if (documentVisible) {
        resumeDrawing()
      } else {
        pauseDrawing()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      image.removeEventListener('load', handleImageLoad)
      image.removeEventListener('error', handleImageError)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      window.clearTimeout(restIdleTimer)
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      )
      window.removeEventListener('pointermove', handleActivity)
      window.removeEventListener('pointerdown', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      canvas.removeEventListener('pointermove', handleCameraPointerMove)
      canvas.removeEventListener('pointerleave', handleCameraPointerLeave)
      requestDrawRef.current = () => {}
    }
  }, [
    assemblyEnd,
    cameraResponse,
    density,
    depth,
    duration,
    easing,
    palette,
    playIntensity,
    playSpeed,
    optimized,
    optimizedReducedMotion,
    revealDuration,
    rotationEnd,
    scale,
    startRotation,
    tilt,
  ])

  return (
    <div
      className="ascii-logo"
      role="img"
      aria-label="Param Ranjan monogram rendered as three-dimensional ASCII art"
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  )
}
