// A level: the problem the child solves, and how to tell when it is solved.
// Pure TypeScript: no React.

import { runSkill } from './skills.ts'
import type { RunFailure, RunStep, SkillBook, SkillId, Step } from './skills.ts'
import type { ItemId, PlaceId, World } from './world.ts'

/** What the world must look like when something is done. Parts left out don't matter. */
export type Target = {
  roboAt?: PlaceId
  /** Items that must lie at these places. */
  items?: Record<ItemId, PlaceId>
  /** Items Robo must be able to see: found, and not hidden. */
  seen?: ItemId[]
}

/** A position on a level's map: x from left to right, y from top to bottom, both 0 to 100. */
export type MapPoint = { x: number; y: number }

export type Level = {
  goal: SkillId
  start: World
  /** What the world must look like once the goal is done. */
  target: Target
  /**
   * What each idea must achieve. When Robo finishes one of these skills, it checks the
   * target, so an idea only counts if it does what its name says.
   */
  checks: Record<SkillId, Target>
  /** Where each place sits on the map, seen from above. x and y run from 0 to 100. */
  map: Record<PlaceId, MapPoint>
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
  const seen = (target.seen ?? []).every((id) => world.items[id] !== undefined && !world.items[id].hidden)
  const placed = Object.entries(target.items ?? {}).every(([id, at]) => world.items[id]?.at === at)
  return seen && placed
}

/** Runs the level's goal with the skills the child has taught Robo, and says how it went. */
export function playLevel(level: Level, book: SkillBook): LevelOutcome {
  const isDone = (skill: SkillId, world: World) => {
    const check: Target | undefined = level.checks[skill]
    return check === undefined || isReached(world, check)
  }

  const result = runSkill(book, level.goal, level.start, isDone)
  if (!result.ok) return { kind: 'stuck', steps: result.steps, failure: result.failure }

  if (!isReached(result.world, level.target)) {
    return { kind: 'notThereYet', steps: result.steps, world: result.world }
  }
  return { kind: 'solved', steps: result.steps }
}
