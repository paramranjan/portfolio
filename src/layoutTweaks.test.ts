import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizePortfolioLayout } from './layoutTweaks.ts'

test('restores supported portfolio layouts', () => {
  assert.equal(normalizePortfolioLayout('current'), 'current')
  assert.equal(normalizePortfolioLayout('studio-split'), 'studio-split')
})

test('defaults missing or invalid portfolio layouts to current', () => {
  assert.equal(normalizePortfolioLayout(null), 'current')
  assert.equal(normalizePortfolioLayout('unknown'), 'current')
})
