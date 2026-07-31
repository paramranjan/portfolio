import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeMotionProfile } from './motionProfile.ts'

test('keeps valid motion profiles', () => {
  assert.equal(normalizeMotionProfile('original'), 'original')
  assert.equal(normalizeMotionProfile('improved'), 'improved')
})

test('defaults missing and invalid motion profiles to improved', () => {
  assert.equal(normalizeMotionProfile(null), 'improved')
  assert.equal(normalizeMotionProfile(''), 'improved')
  assert.equal(normalizeMotionProfile('experimental'), 'improved')
})
