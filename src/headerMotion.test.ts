import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getHeaderMorphLayout,
  getHeaderRenderKey,
  isHeaderMorphEnabled,
  smoothHeaderProgress,
} from './headerMotion.ts'

test('matches the desktop full-width and floating header geometry', () => {
  const layout = getHeaderMorphLayout(1440)

  assert.ok(Math.abs(layout.pagePadding - 43.2) < Number.EPSILON * 1440)
  assert.equal(layout.floatingInset, 380)
})

test('keeps the floating header inside narrow desktop viewports', () => {
  assert.deepEqual(getHeaderMorphLayout(800), {
    pagePadding: 24,
    floatingInset: 60,
  })
})

test('disables the morph for mobile and reduced-motion users', () => {
  assert.equal(isHeaderMorphEnabled(720, false), false)
  assert.equal(isHeaderMorphEnabled(721, false), true)
  assert.equal(isHeaderMorphEnabled(1440, true), false)
})

test('uses the original hybrid scroll interpolation rate', () => {
  assert.equal(smoothHeaderProgress(0, 1), 0.16)
  assert.equal(smoothHeaderProgress(0.5, 1), 0.58)
  assert.equal(smoothHeaderProgress(0.9995, 1), 1)
})

test('remounts the header when Motion styles turn on or off', () => {
  assert.equal(getHeaderRenderKey(true), 'motion')
  assert.equal(getHeaderRenderKey(false), 'static')
})
