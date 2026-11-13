import { expect, test } from 'vitest'
import { playLevel } from '../core/level.ts'
import { riverSkillBook } from '../core/test-fixtures.ts'
import { level1 } from './level1.ts'

// riverSkillBook is what a child who solved level 1 would have taught Robo.

test('level 1 can be solved', () => {
  expect(playLevel(level1, riverSkillBook()).kind).toBe('solved')
})

test('the solution only uses cards that level 1 offers', () => {
  for (const steps of Object.values(riverSkillBook())) {
    for (const step of steps) {
      expect(level1.cards).toContainEqual(step)
    }
  }
})
