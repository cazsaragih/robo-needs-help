import { describe, expect, test } from 'vitest'
import { applyAction, carriedItem } from './world.ts'
import type { Action, FailureReason, World } from './world.ts'

// A tiny version of level 1: the log is hidden in the forest,
// and the river can only be crossed once the log lies on the riverbank.
function riverWorld(): World {
  return {
    roboAt: 'meadow',
    items: { log: { at: 'forest', hidden: true } },
    paths: [
      { between: ['meadow', 'forest'] },
      { between: ['meadow', 'riverbank'] },
      { between: ['riverbank', 'farBank'], needs: { item: 'log', at: 'riverbank' } },
    ],
  }
}

/** Applies actions in order and fails the test if any of them fails. */
function after(world: World, ...actions: Action[]): World {
  for (const action of actions) {
    const result = applyAction(world, action)
    if (!result.ok) throw new Error(`${action.kind} failed: ${result.reason}`)
    world = result.world
  }
  return world
}

function failure(world: World, action: Action): FailureReason | null {
  const result = applyAction(world, action)
  return result.ok ? null : result.reason
}

describe('move', () => {
  test('follows a path in either direction', () => {
    const inForest = after(riverWorld(), { kind: 'move', to: 'forest' })
    expect(inForest.roboAt).toBe('forest')
    expect(after(inForest, { kind: 'move', to: 'meadow' }).roboAt).toBe('meadow')
  })

  test('fails when there is no path', () => {
    expect(failure(riverWorld(), { kind: 'move', to: 'farBank' })).toBe('noPath')
  })

  test('fails when the path needs an item that is not in place', () => {
    const atRiver = after(riverWorld(), { kind: 'move', to: 'riverbank' })
    expect(failure(atRiver, { kind: 'move', to: 'farBank' })).toBe('pathBlocked')
  })

  test('succeeds when Robo is already there', () => {
    expect(after(riverWorld(), { kind: 'move', to: 'meadow' }).roboAt).toBe('meadow')
  })
})

describe('look', () => {
  test('reveals hidden items where Robo is standing', () => {
    const world = after(riverWorld(), { kind: 'move', to: 'forest' }, { kind: 'look' })
    expect(world.items.log.hidden).toBe(false)
  })

  test('does not reveal items somewhere else', () => {
    expect(after(riverWorld(), { kind: 'look' }).items.log.hidden).toBe(true)
  })
})

describe('pickUp', () => {
  test('fails for an item Robo has not seen yet', () => {
    const inForest = after(riverWorld(), { kind: 'move', to: 'forest' })
    expect(failure(inForest, { kind: 'pickUp', item: 'log' })).toBe('itemNotSeen')
  })

  test('fails for an item that is somewhere else, or does not exist', () => {
    expect(failure(riverWorld(), { kind: 'pickUp', item: 'log' })).toBe('itemNotHere')
    expect(failure(riverWorld(), { kind: 'pickUp', item: 'unicorn' })).toBe('itemNotHere')
  })

  test('fails when Robo is already carrying something', () => {
    const world = riverWorld()
    world.items.stone = { at: 'forest', hidden: false }
    const carryingLog = after(
      world,
      { kind: 'move', to: 'forest' },
      { kind: 'look' },
      { kind: 'pickUp', item: 'log' },
    )
    expect(failure(carryingLog, { kind: 'pickUp', item: 'stone' })).toBe('handsFull')
  })
})

describe('putDown', () => {
  test('fails when Robo is carrying nothing', () => {
    expect(failure(riverWorld(), { kind: 'putDown' })).toBe('handsEmpty')
  })

  test('leaves the item where Robo is standing', () => {
    const world = after(
      riverWorld(),
      { kind: 'move', to: 'forest' },
      { kind: 'look' },
      { kind: 'pickUp', item: 'log' },
      { kind: 'move', to: 'meadow' },
      { kind: 'putDown' },
    )
    expect(world.items.log.at).toBe('meadow')
    expect(carriedItem(world)).toBeNull()
  })
})

test('Robo can cross the river once the log is on the riverbank', () => {
  const world = after(
    riverWorld(),
    { kind: 'move', to: 'forest' },
    { kind: 'look' },
    { kind: 'pickUp', item: 'log' },
    { kind: 'move', to: 'meadow' },
    { kind: 'move', to: 'riverbank' },
    { kind: 'putDown' },
    { kind: 'move', to: 'farBank' },
  )
  expect(world.roboAt).toBe('farBank')
})

test('applyAction never changes the world it was given', () => {
  const world = riverWorld()
  const before = structuredClone(world)

  after(world, { kind: 'move', to: 'forest' }, { kind: 'look' }, { kind: 'pickUp', item: 'log' })

  expect(world).toEqual(before)
})
