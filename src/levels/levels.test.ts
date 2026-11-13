import { describe, expect, test } from 'vitest'
import { playLevel } from '../core/level.ts'
import { doAction, doSkill } from '../core/skills.ts'
import type { SkillBook } from '../core/skills.ts'
import { riverSkillBook } from '../core/test-fixtures.ts'
import { levels } from './index.ts'
import { crossTheRiver } from './crossTheRiver.ts'
import { plantAGarden } from './plantAGarden.ts'
import { postTheLetter } from './postTheLetter.ts'

// What a child who solved each level would have taught Robo in it.
const letterSkills: SkillBook = {
  'post the letter': [doSkill('find the letter'), doSkill('carry the letter to the postbox')],
  'find the letter': [doAction({ kind: 'look' })],
  'carry the letter to the postbox': [
    doAction({ kind: 'pickUp', item: 'letter' }),
    doAction({ kind: 'move', to: 'meadow' }),
    doAction({ kind: 'move', to: 'postbox' }),
    doAction({ kind: 'putDown' }),
  ],
}

const gardenSkills: SkillBook = {
  'plant a garden': [doSkill('cross the river'), doSkill('find the seeds'), doSkill('plant the seeds')],
  'find the seeds': [doAction({ kind: 'move', to: 'shed' }), doAction({ kind: 'look' })],
  'plant the seeds': [
    doAction({ kind: 'pickUp', item: 'seeds' }),
    doAction({ kind: 'move', to: 'farBank' }),
    doAction({ kind: 'move', to: 'garden' }),
    doAction({ kind: 'putDown' }),
  ],
}

// One skill book for the whole game, as the child builds it level by level.
const wholeGame: SkillBook = { ...riverSkillBook(), ...letterSkills, ...gardenSkills }

describe.each(levels.map((level, index) => [index + 1, level] as const))('level %i', (_, level) => {
  test('can be solved', () => {
    expect(playLevel(level, wholeGame).kind).toBe('solved')
  })

  test('has a check for every idea card', () => {
    for (const card of level.cards) {
      if (card.kind === 'skill') expect(level.checks).toHaveProperty([card.skill])
    }
  })

  test('has a place on the map for every place in its world', () => {
    for (const { between } of level.start.paths) {
      for (const place of between) expect(level.map).toHaveProperty([place])
    }
  })
})

test('the levels get harder, then easier through reuse', () => {
  expect(levels).toEqual([postTheLetter, crossTheRiver, plantAGarden])
})

test('"post the letter" can be solved with only its own cards', () => {
  for (const steps of Object.values(letterSkills)) {
    for (const step of steps) expect(postTheLetter.cards).toContainEqual(step)
  }
})

describe('"plant a garden" builds on "cross the river"', () => {
  test('"cross the river", taught in the level before, works unchanged here', () => {
    const outcome = playLevel(plantAGarden, wholeGame)

    expect(outcome.kind).toBe('solved')
    expect(plantAGarden.cards).toContainEqual(doSkill('cross the river'))
  })

  test('only the new part needs new cards', () => {
    for (const steps of Object.values(gardenSkills)) {
      for (const step of steps) expect(plantAGarden.cards).toContainEqual(step)
    }
  })

  test('without the river level, Robo asks what crossing the river is made of', () => {
    const outcome = playLevel(plantAGarden, gardenSkills)

    expect(outcome).toMatchObject({ kind: 'stuck', failure: { kind: 'unknownSkill', skill: 'cross the river' } })
  })

  test('the river skill saves the child most of the work', () => {
    const steps = playLevel(plantAGarden, wholeGame).steps
    const taughtHere = Object.values(gardenSkills).flat().filter((step) => step.kind === 'action').length

    expect(steps.length).toBe(13)
    expect(taughtHere).toBe(6)
  })
})
