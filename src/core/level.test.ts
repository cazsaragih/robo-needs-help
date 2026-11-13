import { describe, expect, test } from 'vitest'
import { isReached, playLevel } from './level.ts'
import type { Level } from './level.ts'
import { doAction, doSkill } from './skills.ts'
import { riverSkillBook, riverWorld } from './test-fixtures.ts'

function riverLevel(): Level {
  return {
    goal: 'cross the river',
    start: riverWorld(),
    target: { roboAt: 'farBank' },
    checks: { 'find a log': { seen: ['log'] } },
    map: {},
    cards: [],
  }
}

describe('playLevel', () => {
  test('is solved when the goal runs and Robo ends up at the target', () => {
    const outcome = playLevel(riverLevel(), riverSkillBook())

    expect(outcome.kind).toBe('solved')
    expect(outcome.steps).toHaveLength(7)
  })

  test('is not there yet when every step works but the target is not reached', () => {
    const book = riverSkillBook()
    book['cross the river'] = [doSkill('find a log'), doSkill('carry the log to the river')]

    const outcome = playLevel(riverLevel(), book)

    expect(outcome).toMatchObject({ kind: 'notThereYet', world: { roboAt: 'riverbank' } })
  })

  test('is stuck when an idea does not do what it should', () => {
    const book = riverSkillBook()
    book['find a log'] = [doAction({ kind: 'move', to: 'forest' })] // forgot to look

    const outcome = playLevel(riverLevel(), book)

    expect(outcome).toMatchObject({ kind: 'stuck', failure: { kind: 'notDone', skill: 'find a log' } })
  })

  test('is stuck when the run fails', () => {
    const outcome = playLevel(riverLevel(), {})

    expect(outcome).toMatchObject({ kind: 'stuck', failure: { kind: 'unknownSkill' } })
  })
})

describe('isReached', () => {
  const world = riverWorld() // Robo in the meadow, the log in the forest

  test('checks where Robo is', () => {
    expect(isReached(world, { roboAt: 'meadow' })).toBe(true)
    expect(isReached(world, { roboAt: 'farBank' })).toBe(false)
  })

  test('checks where items are', () => {
    expect(isReached(world, { items: { log: 'forest' } })).toBe(true)
    expect(isReached(world, { items: { log: 'riverbank' } })).toBe(false)
  })

  test('checks which items Robo has seen', () => {
    const looked = { ...world, items: { log: { at: 'forest', hidden: false } } }

    expect(isReached(world, { seen: ['log'] })).toBe(false)
    expect(isReached(looked, { seen: ['log'] })).toBe(true)
    expect(isReached(looked, { seen: ['boat'] })).toBe(false)
  })

  test('needs every part of the target to be true', () => {
    expect(isReached(world, { roboAt: 'meadow', items: { log: 'riverbank' } })).toBe(false)
  })

  test('an empty target is always reached', () => {
    expect(isReached(world, {})).toBe(true)
  })
})
