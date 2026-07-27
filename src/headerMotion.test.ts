import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getHeaderMorphLayout,
  getHeaderRenderKey,
  getResponsiveHeaderProgress,
  getHeaderScrollProgress,
  getHeaderShapeProgress,
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

test('uses the same interpolation rate in both directions', () => {
  assert.equal(smoothHeaderProgress(0, 1), 0.32)
  assert.equal(smoothHeaderProgress(0.5, 1), 0.66)
  assert.equal(smoothHeaderProgress(0.9995, 1), 1)
  assert.ok(Math.abs(smoothHeaderProgress(1, 0) - 0.68) < 0.000001)
  assert.ok(Math.abs(smoothHeaderProgress(0.5, 0) - 0.34) < 0.000001)
})

test('keeps the original easing when the header is close to the scroll target', () => {
  assert.ok(
    Math.abs(getResponsiveHeaderProgress(0.5, 0.6, 0.58) - 0.532) <
      0.000001,
  )
})

test('accelerates when fast scrolling leaves the header behind', () => {
  assert.ok(
    Math.abs(getResponsiveHeaderProgress(0.5, 0.8, 0.75) - 0.65) <
      0.000001,
  )
})

test('snaps large gaps and direction reversals to the current scroll state', () => {
  assert.equal(getResponsiveHeaderProgress(0, 0.8, 0.7), 0.8)
  assert.equal(getResponsiveHeaderProgress(0.6, 0.4, 1), 0.4)
})

test('locks the header at full width around the top boundary', () => {
  assert.equal(getHeaderScrollProgress(-20), 0)
  assert.equal(getHeaderScrollProgress(48), 0)
  assert.equal(getHeaderScrollProgress(133), 0.5)
  assert.equal(getHeaderScrollProgress(218), 1)
  assert.equal(getHeaderScrollProgress(240), 1)
})

test('finishes shape changes before reaching full width', () => {
  assert.equal(getHeaderShapeProgress(0), 0)
  assert.equal(getHeaderShapeProgress(0.03), 0)
  assert.ok(Math.abs(getHeaderShapeProgress(0.515) - 0.5) < 0.000001)
  assert.equal(getHeaderShapeProgress(1), 1)
})

test('remounts the header when Motion styles turn on or off', () => {
  assert.equal(getHeaderRenderKey(true), 'motion')
  assert.equal(getHeaderRenderKey(false), 'static')
})
