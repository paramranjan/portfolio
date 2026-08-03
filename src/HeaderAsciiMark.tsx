import { useEffect, useRef } from 'react'
import type {
  AsciiCameraResponse,
  AsciiPalette,
} from './asciiTweaks.ts'
import type { HeaderMark } from './headerIdentity.ts'
import {
  ASCII_LOGO_PALETTES,
  ASCII_LOGO_SAMPLE_SIZE,
  isLogoPixel,
  randomFor,
} from './asciiLogoSource.ts'

const CAMERA_MAX_YAW = (6 * Math.PI) / 180
const CAMERA_MAX_PITCH = (4 * Math.PI) / 180
const CAMERA_DAMPING = 12
const CAMERA_SETTLE_THRESHOLD = 0.001

type HeaderPoint = {
  x: number
  y: number
  z: number
  colorSeed: number
  alpha: number
}

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1)
}

function createHeaderPoints(
  image: HTMLImageElement | null,
  mark: HeaderMark,
  density: number,
  depth: number,
) {
  const sampleStep = density === 1 ? 3 : density < 4 ? 2 : 1
  const source = document.createElement('canvas')
  source.width = ASCII_LOGO_SAMPLE_SIZE
  source.height = ASCII_LOGO_SAMPLE_SIZE
  const sourceContext = source.getContext('2d', {
    willReadFrequently: true,
  })
  if (!sourceContext) return []

  if (mark === 'micro-pr') {
    sourceContext.fillStyle = '#ffffff'
    sourceContext.font = "72px 'PP Mondwest', serif"
    sourceContext.textAlign = 'center'
    sourceContext.textBaseline = 'middle'
    sourceContext.fillText(
      'PR',
      ASCII_LOGO_SAMPLE_SIZE / 2,
      ASCII_LOGO_SAMPLE_SIZE / 2 + 4,
    )
  } else if (image) {
    sourceContext.drawImage(
      image,
      0,
      0,
      ASCII_LOGO_SAMPLE_SIZE,
      ASCII_LOGO_SAMPLE_SIZE,
    )
  }
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
      const pixelVisible =
        mark === 'micro-pr'
          ? pixels[pixelIndex + 3] > 48
          : isLogoPixel(
              pixels[pixelIndex],
              pixels[pixelIndex + 1],
              pixels[pixelIndex + 2],
            )
      if (pixelVisible) {
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
  const points: HeaderPoint[] = []

  sourcePoints.forEach((point, pointIndex) => {
    const depthSeed = randomFor(pointIndex + 71) - 0.5
    points.push({
      x: (point.x - centerX) / halfWidth,
      y: (point.y - centerY) / halfWidth,
      z: depthSeed * 2 * (depth / 100) * 0.35,
      colorSeed: randomFor(pointIndex + 197),
      alpha: 0.82 + randomFor(pointIndex + 223) * 0.18,
    })
  })

  return points
}

export function HeaderAsciiMark({
  mark,
  scale,
  density,
  depth,
  tilt,
  palette,
  cameraResponse,
}: {
  mark: HeaderMark
  scale: number
  density: number
  depth: number
  tilt: number
  palette: AsciiPalette
  cameraResponse: AsciiCameraResponse
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const cssWidth = 82
    const cssHeight = 36
    const pixelRatio = Math.min(
      Math.max(window.devicePixelRatio || 1, 2),
      3,
    )
    const colors = ASCII_LOGO_PALETTES[palette]
    const cameraEnabled =
      cameraResponse === 'subtle' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const image = mark === 'full-logo' ? new Image() : null
    let disposed = false
    let points: HeaderPoint[] = []
    let frame = 0
    let lastTimestamp = 0
    let cameraTargetYaw = 0
    let cameraTargetPitch = 0
    let cameraYaw = 0
    let cameraPitch = 0

    canvas.width = cssWidth * pixelRatio
    canvas.height = cssHeight * pixelRatio
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    context.imageSmoothingEnabled = false

    const draw = (timestamp = 0) => {
      frame = 0
      if (points.length === 0) return

      const frameDelta =
        lastTimestamp === 0
          ? 0
          : Math.min((timestamp - lastTimestamp) / 1000, 1 / 20)
      lastTimestamp = timestamp
      if (cameraEnabled && frameDelta > 0) {
        const damping = 1 - Math.exp(-CAMERA_DAMPING * frameDelta)
        cameraYaw += (cameraTargetYaw - cameraYaw) * damping
        cameraPitch += (cameraTargetPitch - cameraPitch) * damping
      }

      const angleY = (tilt * Math.PI) / 180 + cameraYaw
      const angleX = 0.05 + cameraPitch
      const sinY = Math.sin(angleY)
      const cosY = Math.cos(angleY)
      const sinX = Math.sin(angleX)
      const cosX = Math.cos(angleX)
      const objectScale = 30 * scale
      const particleSize =
        density === 1 ? 2.3 : density === 2 ? 1.8 : density === 3 ? 1.35 : 0.9
      const snap = (value: number) =>
        Math.round(value * pixelRatio) / pixelRatio
      const projected = points.map((point) => {
        const rotatedX = point.x * cosY + point.z * sinY
        const rotatedZ = -point.x * sinY + point.z * cosY
        const rotatedY = point.y * cosX - rotatedZ * sinX
        const pointDepth = point.y * sinX + rotatedZ * cosX
        const perspective = 1.7 / (1.7 + pointDepth * 0.22)

        return {
          ...point,
          drawX: cssWidth / 2 + rotatedX * objectScale * perspective,
          drawY: cssHeight / 2 + rotatedY * objectScale * perspective,
          pointDepth,
        }
      })

      context.clearRect(0, 0, cssWidth, cssHeight)
      projected
        .sort((first, second) => first.pointDepth - second.pointDepth)
        .forEach((point) => {
          context.globalAlpha = point.alpha
          context.fillStyle =
            point.colorSeed < 0.78
              ? colors[palette === 'site' ? 1 : 2]
              : point.colorSeed < 0.9
                ? colors[0]
                : colors[2]
          const x = snap(point.drawX)
          const y = snap(point.drawY)

          context.fillRect(
            snap(x - particleSize / 2),
            snap(y - particleSize / 2),
            snap(particleSize),
            snap(particleSize),
          )
        })
      context.globalAlpha = 1

      const cameraMoving =
        cameraEnabled &&
        (Math.abs(cameraTargetYaw - cameraYaw) >
          CAMERA_SETTLE_THRESHOLD ||
          Math.abs(cameraTargetPitch - cameraPitch) >
            CAMERA_SETTLE_THRESHOLD)
      if (cameraMoving) frame = window.requestAnimationFrame(draw)
    }

    const requestDraw = () => {
      if (frame === 0) frame = window.requestAnimationFrame(draw)
    }
    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      if (bounds.width === 0 || bounds.height === 0) return

      const normalizedX =
        clamp((event.clientX - bounds.left) / bounds.width) * 2 - 1
      const normalizedY =
        clamp((event.clientY - bounds.top) / bounds.height) * 2 - 1
      cameraTargetYaw = normalizedX * CAMERA_MAX_YAW
      cameraTargetPitch = normalizedY * -CAMERA_MAX_PITCH
      requestDraw()
    }
    const handlePointerLeave = () => {
      cameraTargetYaw = 0
      cameraTargetPitch = 0
      requestDraw()
    }
    const initializePoints = () => {
      if (disposed) return
      points = createHeaderPoints(image, mark, density, depth)
      requestDraw()
    }

    if (cameraEnabled) {
      canvas.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      })
      canvas.addEventListener('pointerleave', handlePointerLeave)
    }
    if (image) {
      image.addEventListener('load', initializePoints)
      image.src = '/logo-ascii-source.jpg'
    } else {
      void document.fonts
        .load("72px 'PP Mondwest'")
        .then(initializePoints)
    }

    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      image?.removeEventListener('load', initializePoints)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [cameraResponse, density, depth, mark, palette, scale, tilt])

  return (
    <span className="wordmark__ascii" aria-hidden="true">
      <canvas ref={canvasRef} />
    </span>
  )
}
