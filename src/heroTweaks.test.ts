import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getMobileHeroFontSize,
  normalizeHeroAlignment,
  normalizeHeroFont,
  normalizeHeroFontSize,
} from './heroTweaks.ts'

test('restores valid hero tweak choices', () => {
  assert.equal(normalizeHeroAlignment('center'), 'center')
  assert.equal(normalizeHeroFont('pp-mondwest'), 'pp-mondwest')
  assert.equal(normalizeHeroFontSize('112'), 112)
})

test('uses safe defaults for invalid saved hero tweaks', () => {
  assert.equal(normalizeHeroAlignment('right'), 'center')
  assert.equal(normalizeHeroFont('comic-sans'), 'pp-mondwest')
  assert.equal(normalizeHeroFontSize('not-a-number'), 60)
})

test('keeps the hero size slider within its supported range', () => {
  assert.equal(normalizeHeroFontSize('20'), 48)
  assert.equal(normalizeHeroFontSize('200'), 140)
})

test('maps every desktop slider size to a distinct mobile size', () => {
  assert.equal(getMobileHeroFontSize(48), 44)
  assert.equal(getMobileHeroFontSize(100), 67.7)
  assert.equal(getMobileHeroFontSize(140), 86)
})
