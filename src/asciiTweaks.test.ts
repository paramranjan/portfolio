import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getAsciiEasingCss,
  normalizeAsciiAssemblyEnd,
  normalizeAsciiCopyDelay,
  normalizeAsciiCopyDuration,
  normalizeAsciiCopyRise,
  normalizeAsciiDensity,
  normalizeAsciiDepth,
  normalizeAsciiDuration,
  normalizeAsciiEasing,
  normalizeAsciiPalette,
  normalizeAsciiPlayIntensity,
  normalizeAsciiPlaySpeed,
  normalizeAsciiRevealDuration,
  normalizeAsciiRestState,
  normalizeAsciiRotationEnd,
  normalizeAsciiScale,
  normalizeAsciiStartRotation,
  normalizeAsciiTilt,
  normalizeAsciiTravelDuration,
} from './asciiTweaks.ts'

test('restores valid ASCII logo settings', () => {
  assert.equal(normalizeAsciiScale('112'), 112)
  assert.equal(normalizeAsciiDensity('4'), 4)
  assert.equal(normalizeAsciiDepth('22'), 22)
  assert.equal(normalizeAsciiTilt('-14'), -14)
  assert.equal(normalizeAsciiDuration('3400'), 3400)
  assert.equal(normalizeAsciiPalette('blue'), 'blue')
  assert.equal(normalizeAsciiStartRotation('-120'), -120)
  assert.equal(normalizeAsciiRotationEnd('68'), 68)
  assert.equal(normalizeAsciiAssemblyEnd('74'), 74)
  assert.equal(normalizeAsciiRevealDuration('52'), 52)
  assert.equal(normalizeAsciiTravelDuration('1100'), 1100)
  assert.equal(normalizeAsciiCopyDelay('300'), 300)
  assert.equal(normalizeAsciiCopyRise('72'), 72)
  assert.equal(normalizeAsciiCopyDuration('950'), 950)
  assert.equal(normalizeAsciiEasing('out'), 'out')
  assert.equal(normalizeAsciiPlayIntensity('55'), 55)
  assert.equal(normalizeAsciiPlaySpeed('140'), 140)
  assert.equal(normalizeAsciiRestState('true'), true)
  assert.equal(getAsciiEasingCss('linear'), 'linear')
})

test('uses safe defaults for invalid ASCII logo settings', () => {
  assert.equal(normalizeAsciiScale('large'), 91)
  assert.equal(normalizeAsciiDensity('dense'), 4)
  assert.equal(normalizeAsciiDepth('deep'), 11)
  assert.equal(normalizeAsciiTilt('angled'), 0)
  assert.equal(normalizeAsciiDuration('slow'), 1900)
  assert.equal(normalizeAsciiPalette('rainbow'), 'site')
  assert.equal(normalizeAsciiStartRotation('left'), 0)
  assert.equal(normalizeAsciiRotationEnd('late'), 30)
  assert.equal(normalizeAsciiAssemblyEnd('late'), 64)
  assert.equal(normalizeAsciiRevealDuration('slow'), 27)
  assert.equal(normalizeAsciiTravelDuration('slow'), 800)
  assert.equal(normalizeAsciiCopyDelay('late'), 200)
  assert.equal(normalizeAsciiCopyRise('high'), 37)
  assert.equal(normalizeAsciiCopyDuration('slow'), 600)
  assert.equal(normalizeAsciiEasing('spring'), 'out')
  assert.equal(normalizeAsciiPlayIntensity('high'), 19)
  assert.equal(normalizeAsciiPlaySpeed('fast'), 140)
  assert.equal(normalizeAsciiRestState(null), true)
  assert.equal(normalizeAsciiRestState('enabled'), true)
})

test('uses the live ASCII preset when storage is missing', () => {
  assert.equal(normalizeAsciiScale(null), 91)
  assert.equal(normalizeAsciiDensity(null), 4)
  assert.equal(normalizeAsciiDepth(null), 11)
  assert.equal(normalizeAsciiTilt(null), 0)
  assert.equal(normalizeAsciiDuration(null), 1900)
  assert.equal(normalizeAsciiPalette(null), 'site')
  assert.equal(normalizeAsciiRestState(null), true)
})

test('keeps numeric ASCII controls within their supported ranges', () => {
  assert.equal(normalizeAsciiScale('20'), 60)
  assert.equal(normalizeAsciiScale('200'), 130)
  assert.equal(normalizeAsciiDensity('0'), 1)
  assert.equal(normalizeAsciiDensity('8'), 4)
  assert.equal(normalizeAsciiDepth('-10'), 0)
  assert.equal(normalizeAsciiDepth('50'), 30)
  assert.equal(normalizeAsciiTilt('-90'), -30)
  assert.equal(normalizeAsciiTilt('90'), 30)
  assert.equal(normalizeAsciiDuration('400'), 1200)
  assert.equal(normalizeAsciiDuration('9000'), 5000)
  assert.equal(normalizeAsciiStartRotation('-360'), -180)
  assert.equal(normalizeAsciiStartRotation('360'), 180)
  assert.equal(normalizeAsciiRotationEnd('10'), 30)
  assert.equal(normalizeAsciiRotationEnd('120'), 100)
  assert.equal(normalizeAsciiAssemblyEnd('10'), 30)
  assert.equal(normalizeAsciiAssemblyEnd('120'), 100)
  assert.equal(normalizeAsciiRevealDuration('5'), 20)
  assert.equal(normalizeAsciiRevealDuration('100'), 80)
  assert.equal(normalizeAsciiTravelDuration('50'), 200)
  assert.equal(normalizeAsciiTravelDuration('3000'), 1800)
  assert.equal(normalizeAsciiCopyDelay('-20'), 0)
  assert.equal(normalizeAsciiCopyDelay('2000'), 1500)
  assert.equal(normalizeAsciiCopyRise('-20'), 0)
  assert.equal(normalizeAsciiCopyRise('300'), 200)
  assert.equal(normalizeAsciiCopyDuration('50'), 200)
  assert.equal(normalizeAsciiCopyDuration('3000'), 1800)
  assert.equal(normalizeAsciiPlayIntensity('-20'), 0)
  assert.equal(normalizeAsciiPlayIntensity('200'), 100)
  assert.equal(normalizeAsciiPlaySpeed('5'), 25)
  assert.equal(normalizeAsciiPlaySpeed('500'), 200)
})
