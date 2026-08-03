import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CURSOR_BALL_MAX_SPEED,
  CURSOR_BALL_MIN_DRAG,
  getLaunchVelocity,
  normalizeCursorBallEnabled,
} from './cursorBallPhysics.ts'

test('launches opposite the cue pull direction', () => {
  const velocity = getLaunchVelocity(
    { x: 100, y: 100 },
    { x: 160, y: 100 },
  )

  assert.ok(velocity.x < 0)
  assert.equal(velocity.y, 0)
  assert.ok(velocity.speed > 0)
})

test('does not launch below the drag threshold', () => {
  const velocity = getLaunchVelocity(
    { x: 100, y: 100 },
    { x: 100 + CURSOR_BALL_MIN_DRAG - 1, y: 100 },
  )

  assert.deepEqual(velocity, { x: 0, y: 0, speed: 0, power: 0 })
})

test('caps launch velocity for long pulls', () => {
  const velocity = getLaunchVelocity(
    { x: 100, y: 100 },
    { x: 1000, y: 100 },
  )

  assert.equal(velocity.speed, CURSOR_BALL_MAX_SPEED)
  assert.equal(velocity.power, 1)
})

test('launches diagonally opposite the pull direction', () => {
  const velocity = getLaunchVelocity(
    { x: 100, y: 100 },
    { x: 140, y: 140 },
  )

  assert.ok(velocity.x < 0)
  assert.ok(velocity.y < 0)
})

test('starts at zero power at the launch threshold', () => {
  const velocity = getLaunchVelocity(
    { x: 100, y: 100 },
    { x: 100 + CURSOR_BALL_MIN_DRAG, y: 100 },
  )

  assert.equal(velocity.power, 0)
  assert.ok(velocity.speed > 0)
})

test('enables the launcher unless explicitly disabled', () => {
  assert.equal(normalizeCursorBallEnabled(null), true)
  assert.equal(normalizeCursorBallEnabled('true'), true)
  assert.equal(normalizeCursorBallEnabled('false'), false)
})
