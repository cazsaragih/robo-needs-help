import { expect, test } from 'vitest'
import { playLevel } from '../core/level.ts'
import { doAction, doSkill } from '../core/skills.ts'
import { riverSkillBook } from '../core/test-fixtures.ts'
import { crossTheRiver } from './crossTheRiver.ts'

// riverSkillBook is what a child who solved the river level would have taught Robo.

const goToForest = doAction({ kind: 'move', to: 'forest' })
const look = doAction({ kind: 'look' })
const pickUp = doAction({ kind: 'pickUp', item: 'log' })
const goToMeadow = doAction({ kind: 'move', to: 'meadow' })
const goToRiver = doAction({ kind: 'move', to: 'riverbank' })
const putDown = doAction({ kind: 'putDown' })
const goAcross = doAction({ kind: 'move', to: 'farBank' })
const everyAction = [goToForest, look, pickUp, goToMeadow, goToRiver, putDown, goAcross]

test('the river level can be solved', () => {
  expect(playLevel(crossTheRiver, riverSkillBook()).kind).toBe('solved')
})

test('the solution only uses cards that the river level offers', () => {
  for (const steps of Object.values(riverSkillBook())) {
    for (const step of steps) {
      expect(crossTheRiver.cards).toContainEqual(step)
    }
  }
})

test('every idea card has a check', () => {
  for (const card of crossTheRiver.cards) {
    if (card.kind === 'skill') expect(crossTheRiver.checks).toHaveProperty([card.skill])
  }
})

test('"build a boat" is a dead end, even holding the whole solution', () => {
  const book = { 'cross the river': [doSkill('build a boat')], 'build a boat': everyAction }

  expect(playLevel(crossTheRiver, book)).toMatchObject({ kind: 'stuck', failure: { kind: 'notDone', skill: 'build a boat' } })
})

test('an idea only counts if it does what its name says', () => {
  const book = {
    'cross the river': [doSkill('walk across'), doSkill('find a log')],
    'walk across': [goToForest, look, pickUp, goToMeadow],
    'find a log': [goToRiver, putDown, goAcross],
  }

  expect(playLevel(crossTheRiver, book)).toMatchObject({ kind: 'stuck', failure: { kind: 'notDone', skill: 'walk across' } })
})

test('ideas can still be broken down in more than one way', () => {
  const book = {
    'cross the river': [doSkill('find a log'), doSkill('carry the log to the river'), doSkill('walk across')],
    'find a log': [goToForest, look, pickUp], // picking up here works too
    'carry the log to the river': [goToMeadow, goToRiver, putDown],
    'walk across': [goAcross],
  }

  expect(playLevel(crossTheRiver, book).kind).toBe('solved')
})
