import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getHeaderTitleText,
  normalizeHeaderAsciiDensity,
  normalizeHeaderAsciiRevealDelay,
  normalizeHeaderMark,
  normalizeHeaderTitle,
} from './headerIdentity.ts'

test('restores supported header titles', () => {
  assert.equal(normalizeHeaderTitle('prm-rnjn'), 'prm-rnjn')
  assert.equal(normalizeHeaderTitle('param'), 'param')
})

test('restores supported header marks', () => {
  assert.equal(normalizeHeaderMark('micro-pr'), 'micro-pr')
  assert.equal(normalizeHeaderMark('full-logo'), 'full-logo')
  assert.equal(normalizeHeaderMark(null), 'micro-pr')
})

test('defaults invalid header titles to PRM RNJN', () => {
  assert.equal(normalizeHeaderTitle(null), 'prm-rnjn')
  assert.equal(normalizeHeaderTitle('PR'), 'prm-rnjn')
  assert.equal(getHeaderTitleText('prm-rnjn'), 'PRM RNJN')
  assert.equal(getHeaderTitleText('param'), 'param')
})

test('restores supported header ASCII reveal delay', () => {
  assert.equal(normalizeHeaderAsciiRevealDelay('450'), 450)
})

test('keeps header ASCII reveal delay within safe defaults', () => {
  assert.equal(normalizeHeaderAsciiRevealDelay(null), 300)
  assert.equal(normalizeHeaderAsciiRevealDelay('-100'), 0)
  assert.equal(normalizeHeaderAsciiRevealDelay('1500'), 1000)
})

test('uses a sparse default for the miniature header ASCII logo', () => {
  assert.equal(normalizeHeaderAsciiDensity(null), 2)
  assert.equal(normalizeHeaderAsciiDensity('0'), 1)
  assert.equal(normalizeHeaderAsciiDensity('8'), 4)
})
