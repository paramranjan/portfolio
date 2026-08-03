import { useEffect, useRef, useState } from 'react'
import {
  CURSOR_BALL_MAX_DRAG,
  CURSOR_BALL_MIN_DRAG,
  getLaunchVelocity,
  type Point,
} from './cursorBallPhysics.ts'

const MAX_BALLS = 8
const BALL_RADIUS = 5
const BALL_LIFETIME = 5.6
const BALL_FADE_DURATION = 1.35
const BALL_DRAG = 0.42
const BALL_RESTITUTION = 0.84
const BALL_STOP_SPEED = 22
const SURFACE_SELECTOR = '.hero, .studio-layout__identity'
const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, [role="button"], [contenteditable="true"]'

type Ball = {
  x: number
  y: number
  previousX: number
  previousY: number
  velocityX: number
  velocityY: number
  age: number
  radius: number
  surface: HTMLElement
}

type Aim = {
  pointerId: number
  origin: Point
  pull: Point
  surface: HTMLElement
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function getVisibleBounds(surface: HTMLElement) {
  const bounds = surface.getBoundingClientRect()

  return {
    left: Math.max(bounds.left, 0),
    top: Math.max(bounds.top, 0),
    right: Math.min(bounds.right, window.innerWidth),
    bottom: Math.min(bounds.bottom, window.innerHeight),
  }
}

function isEligibleTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null
  if (target.closest(INTERACTIVE_SELECTOR)) return null
  return target.closest<HTMLElement>(SURFACE_SELECTOR)
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const updateMatches = () => setMatches(mediaQuery.matches)

    updateMatches()
    mediaQuery.addEventListener('change', updateMatches)
    return () => mediaQuery.removeEventListener('change', updateMatches)
  }, [query])

  return matches
}

export function CursorBallLauncher({ enabled }: { enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const finePointer = useMediaQuery(
    '(hover: hover) and (pointer: fine)',
  )
  const reducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  )

  useEffect(() => {
    if (!enabled || !finePointer || reducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    let pixelRatio = 1
    let frame = 0
    let previousTimestamp = 0
    let aim: Aim | null = null
    let balls: Ball[] = []

    const resizeCanvas = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(window.innerWidth * pixelRatio)
      canvas.height = Math.round(window.innerHeight * pixelRatio)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.imageSmoothingEnabled = false
      previousTimestamp = 0
      requestDraw()
    }

    const requestDraw = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(draw)
      }
    }

    const drawAim = (currentAim: Aim) => {
      const launch = getLaunchVelocity(currentAim.origin, currentAim.pull)
      const pullX = currentAim.pull.x - currentAim.origin.x
      const pullY = currentAim.pull.y - currentAim.origin.y
      const pullDistance = Math.hypot(pullX, pullY)
      const directionX = pullDistance === 0 ? 0 : pullX / pullDistance
      const directionY = pullDistance === 0 ? 0 : pullY / pullDistance
      const clampedDistance = Math.min(pullDistance, CURSOR_BALL_MAX_DRAG)
      const cueEndX =
        currentAim.origin.x + directionX * clampedDistance
      const cueEndY =
        currentAim.origin.y + directionY * clampedDistance
      const trajectoryLength = 74 + launch.power * 72

      context.save()
      context.lineCap = 'round'
      context.strokeStyle = `rgba(241, 240, 235, ${
        0.32 + launch.power * 0.3
      })`
      context.lineWidth = 2
      context.beginPath()
      context.moveTo(
        currentAim.origin.x + directionX * 12,
        currentAim.origin.y + directionY * 12,
      )
      context.lineTo(cueEndX, cueEndY)
      context.stroke()

      if (pullDistance >= CURSOR_BALL_MIN_DRAG) {
        context.setLineDash([3, 7])
        context.strokeStyle = `rgba(185, 255, 57, ${
          0.42 + launch.power * 0.45
        })`
        context.lineWidth = 1
        context.beginPath()
        context.moveTo(
          currentAim.origin.x - directionX * 12,
          currentAim.origin.y - directionY * 12,
        )
        context.lineTo(
          currentAim.origin.x - directionX * trajectoryLength,
          currentAim.origin.y - directionY * trajectoryLength,
        )
        context.stroke()
        context.setLineDash([])
      }

      context.fillStyle = '#b9ff39'
      context.beginPath()
      context.arc(
        currentAim.origin.x,
        currentAim.origin.y,
        BALL_RADIUS + launch.power * 2,
        0,
        Math.PI * 2,
      )
      context.fill()

      context.strokeStyle = `rgba(185, 255, 57, ${
        0.3 + launch.power * 0.55
      })`
      context.lineWidth = 1
      context.beginPath()
      context.arc(
        currentAim.origin.x,
        currentAim.origin.y,
        12 + launch.power * 9,
        0,
        Math.PI * 2,
      )
      context.stroke()
      context.restore()
    }

    const updateBalls = (deltaSeconds: number) => {
      const damping = Math.exp(-BALL_DRAG * deltaSeconds)

      balls = balls.filter((ball) => {
        ball.age += deltaSeconds
        if (ball.age >= BALL_LIFETIME) return false

        const bounds = getVisibleBounds(ball.surface)
        if (
          bounds.right <= bounds.left ||
          bounds.bottom <= bounds.top
        ) {
          return false
        }

        ball.previousX = ball.x
        ball.previousY = ball.y
        ball.velocityX *= damping
        ball.velocityY *= damping
        ball.x += ball.velocityX * deltaSeconds
        ball.y += ball.velocityY * deltaSeconds

        if (ball.x - ball.radius < bounds.left) {
          ball.x = bounds.left + ball.radius
          ball.velocityX = Math.abs(ball.velocityX) * BALL_RESTITUTION
        } else if (ball.x + ball.radius > bounds.right) {
          ball.x = bounds.right - ball.radius
          ball.velocityX = -Math.abs(ball.velocityX) * BALL_RESTITUTION
        }

        if (ball.y - ball.radius < bounds.top) {
          ball.y = bounds.top + ball.radius
          ball.velocityY = Math.abs(ball.velocityY) * BALL_RESTITUTION
        } else if (ball.y + ball.radius > bounds.bottom) {
          ball.y = bounds.bottom - ball.radius
          ball.velocityY = -Math.abs(ball.velocityY) * BALL_RESTITUTION
        }

        const speed = Math.hypot(ball.velocityX, ball.velocityY)
        if (speed < BALL_STOP_SPEED) {
          ball.velocityX = 0
          ball.velocityY = 0
        }

        return true
      })
    }

    const drawBalls = () => {
      balls.forEach((ball) => {
        const remaining = BALL_LIFETIME - ball.age
        const opacity = clamp(remaining / BALL_FADE_DURATION, 0, 1)
        const speed = Math.hypot(ball.velocityX, ball.velocityY)
        const trailOpacity = Math.min(speed / 900, 1) * 0.22 * opacity

        if (trailOpacity > 0.015) {
          context.strokeStyle = `rgba(185, 255, 57, ${trailOpacity})`
          context.lineWidth = ball.radius * 1.2
          context.lineCap = 'round'
          context.beginPath()
          context.moveTo(ball.previousX, ball.previousY)
          context.lineTo(ball.x, ball.y)
          context.stroke()
        }

        context.globalAlpha = opacity
        context.fillStyle = '#b9ff39'
        context.beginPath()
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
        context.fill()
        context.globalAlpha = 1
      })
    }

    const draw = (timestamp: number) => {
      frame = 0
      const deltaSeconds =
        previousTimestamp === 0
          ? 0
          : Math.min((timestamp - previousTimestamp) / 1000, 1 / 20)
      previousTimestamp = timestamp

      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      if (deltaSeconds > 0) updateBalls(deltaSeconds)
      drawBalls()
      if (aim) drawAim(aim)

      if (aim || balls.length > 0) requestDraw()
      else previousTimestamp = 0
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || aim) return

      const surface = isEligibleTarget(event.target)
      if (!surface) return

      event.preventDefault()
      surface.setPointerCapture(event.pointerId)
      aim = {
        pointerId: event.pointerId,
        origin: { x: event.clientX, y: event.clientY },
        pull: { x: event.clientX, y: event.clientY },
        surface,
      }
      document.documentElement.dataset.cursorBallAiming = 'true'
      requestDraw()
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!aim || event.pointerId !== aim.pointerId) return

      const bounds = getVisibleBounds(aim.surface)
      aim.pull = {
        x: clamp(event.clientX, bounds.left, bounds.right),
        y: clamp(event.clientY, bounds.top, bounds.bottom),
      }
      requestDraw()
    }

    const finishAim = (event: PointerEvent, cancelled: boolean) => {
      if (!aim || event.pointerId !== aim.pointerId) return

      const completedAim = aim
      aim = null
      if (
        completedAim.surface.hasPointerCapture(completedAim.pointerId)
      ) {
        completedAim.surface.releasePointerCapture(
          completedAim.pointerId,
        )
      }
      delete document.documentElement.dataset.cursorBallAiming

      if (!cancelled) {
        const launch = getLaunchVelocity(
          completedAim.origin,
          completedAim.pull,
        )
        if (launch.speed > 0) {
          balls.push({
            x: completedAim.origin.x,
            y: completedAim.origin.y,
            previousX: completedAim.origin.x,
            previousY: completedAim.origin.y,
            velocityX: launch.x,
            velocityY: launch.y,
            age: 0,
            radius: BALL_RADIUS + launch.power * 1.5,
            surface: completedAim.surface,
          })
          if (balls.length > MAX_BALLS) balls.shift()
        }
      }

      requestDraw()
    }

    const handlePointerUp = (event: PointerEvent) =>
      finishAim(event, false)
    const handlePointerCancel = (event: PointerEvent) =>
      finishAim(event, true)
    const handleVisibilityChange = () => {
      if (!document.hidden) return
      if (aim?.surface.hasPointerCapture(aim.pointerId)) {
        aim.surface.releasePointerCapture(aim.pointerId)
      }
      aim = null
      balls = []
      delete document.documentElement.dataset.cursorBallAiming
      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    document.addEventListener('pointerdown', handlePointerDown, {
      passive: false,
    })
    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    })
    window.addEventListener('pointerup', handlePointerUp, {
      passive: true,
    })
    window.addEventListener('pointercancel', handlePointerCancel, {
      passive: true,
    })
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.cancelAnimationFrame(frame)
      delete document.documentElement.dataset.cursorBallAiming
      window.removeEventListener('resize', resizeCanvas)
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      )
    }
  }, [enabled, finePointer, reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className="cursor-ball-launcher"
      aria-hidden="true"
    />
  )
}
