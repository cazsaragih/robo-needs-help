import { describe, expect, test } from 'vitest'
import { doAction, runSkill, doSkill } from './skills.ts'
import type { RunFailure, RunResult } from './skills.ts'
import { riverSkillBook, riverWorld } from './test-fixtures.ts'

function failureOf(result: RunResult): RunFailure {
  if (result.ok) throw new Error('expected the run to fail')
  return result.failure
}

test('Robo crosses the river using the skills it was taught', () => {
  const result = runSkill(riverSkillBook(), 'cross the river', riverWorld())

  expect(result).toMatchObject({ ok: true, world: { roboAt: 'farBank' } })
  expect(result.steps).toHaveLength(7)
})

test('each step records where it sits in the tree', () => {
  const { steps } = runSkill(riverSkillBook(), 'cross the river', riverWorld())

  expect(steps.map((step) => step.path)).toEqual([
    [0, 0], [0, 1],
    [1, 0], [1, 1], [1, 2], [1, 3],
    [2, 0],
  ])
})

describe('when Robo gets stuck', () => {
  test('asks about the goal itself when Robo knows no skills yet', () => {
    const result = runSkill({}, 'cross the river', riverWorld())

    expect(failureOf(result)).toEqual({ kind: 'unknownSkill', path: [], skill: 'cross the river' })
    expect(result.steps).toEqual([])
  })

  test('reports a step Robo has not been taught yet, after doing the steps before it', () => {
    const book = riverSkillBook()
    delete book['walk across']

    const result = runSkill(book, 'cross the river', riverWorld())

    expect(failureOf(result)).toEqual({ kind: 'unknownSkill', path: [2], skill: 'walk across' })
    expect(result.steps).toHaveLength(6)
  })

  test('stops at the first action that fails', () => {
    const book = riverSkillBook()
    book['find a log'] = [doAction({ kind: 'move', to: 'forest' })] // forgot to look

    const result = runSkill(book, 'cross the river', riverWorld())

    expect(failureOf(result)).toEqual({ kind: 'actionFailed', path: [1, 0], reason: 'itemNotSeen' })
    expect(result.steps).toHaveLength(1)
  })

  test('reports a skill that uses itself instead of running forever', () => {
    const result = runSkill({ forever: [doSkill('forever')] }, 'forever', riverWorld())

    expect(failureOf(result)).toEqual({ kind: 'loop', path: [0], skill: 'forever' })
  })
})

test('a skill can be used more than once', () => {
  const book = {
    'look around twice': [doSkill('look around'), doSkill('look around')],
    'look around': [doAction({ kind: 'look' })],
  }

  const result = runSkill(book, 'look around twice', riverWorld())

  expect(result.ok).toBe(true)
  expect(result.steps).toHaveLength(2)
})

test('runSkill never changes the book or the world it was given', () => {
  const book = riverSkillBook()
  const world = riverWorld()

  runSkill(book, 'cross the river', world)

  expect(book).toEqual(riverSkillBook())
  expect(world).toEqual(riverWorld())
})
