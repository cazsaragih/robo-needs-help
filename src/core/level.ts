// A level: the problem the child solves, and how to tell when it is solved.
// Pure TypeScript: no React.

import { runSkill } from './skills.ts'
import type { RunFailure, RunStep, SkillBook, SkillId, Step } from './skills.ts'
import type { ItemId, PlaceId, World } from './world.ts'

/** What the world must look like when Robo has finished. Parts left out don't matter. */
export type Target = {
  roboAt?: PlaceId
  items?: Record<ItemId, PlaceId>
}

export type Level = {
  goal: SkillId
  start: World
  target: Target
  /**
   * The cards the child picks steps from: idea cards (skills to break down further,
   * some of which don't help) and the basic actions this level needs.
   */
  cards: Step[]
}

export type LevelOutcome =
  | { kind: 'solved'; steps: RunStep[] }
  | { kind: 'notThereYet'; steps: RunStep[]; world: World }
  | { kind: 'stuck'; steps: RunStep[]; failure: RunFailure }

/** True when every part of the target is true in the world. */
export function isReached(world: World, target: Target): boolean {
  if (target.roboAt !== undefined && world.roboAt !== target.roboAt) return false
  return Object.entries(target.items ?? {}).every(([id, at]) => world.items[id]?.at === at)
}

/** Runs the level's goal with the skills the child has taught Robo, and says how it went. */
export function playLevel(level: Level, book: SkillBook): LevelOutcome {
  const result = runSkill(book, level.goal, level.start)
  if (!result.ok) return { kind: 'stuck', steps: result.steps, failure: result.failure }

  if (!isReached(result.world, level.target)) {
    return { kind: 'notThereYet', steps: result.steps, world: result.world }
  }
  return { kind: 'solved', steps: result.steps }
}
