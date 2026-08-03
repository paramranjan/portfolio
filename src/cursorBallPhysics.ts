export const CURSOR_BALL_MIN_DRAG = 10
export const CURSOR_BALL_MAX_DRAG = 170
export const CURSOR_BALL_MIN_SPEED = 320
export const CURSOR_BALL_MAX_SPEED = 1180

export type Point = {
  x: number
  y: number
}

export type Velocity = {
  x: number
  y: number
  speed: number
  power: number
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function removeSignedZero(value: number) {
  return Object.is(value, -0) ? 0 : value
}

export function getLaunchVelocity(origin: Point, pull: Point): Velocity {
  const pullX = pull.x - origin.x
  const pullY = pull.y - origin.y
  const distance = Math.hypot(pullX, pullY)
  const power = clamp(
    (distance - CURSOR_BALL_MIN_DRAG) /
      (CURSOR_BALL_MAX_DRAG - CURSOR_BALL_MIN_DRAG),
    0,
    1,
  )

  if (distance < CURSOR_BALL_MIN_DRAG) {
    return { x: 0, y: 0, speed: 0, power: 0 }
  }

  const speed =
    CURSOR_BALL_MIN_SPEED +
    (CURSOR_BALL_MAX_SPEED - CURSOR_BALL_MIN_SPEED) * power

  return {
    x: removeSignedZero((-pullX / distance) * speed),
    y: removeSignedZero((-pullY / distance) * speed),
    speed,
    power,
  }
}

export function normalizeCursorBallEnabled(value: string | null) {
  return value !== 'false'
}
