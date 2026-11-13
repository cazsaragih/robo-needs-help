// Skills: what the child has taught Robo, and running a skill against a world.
// Pure TypeScript: no React, no timers, no randomness.

import { applyAction } from './world.ts'
import type { Action, FailureReason, World } from './world.ts'

export type SkillId = string

/** One step of a skill: a basic action Robo knows, or another skill used by its name. */
export type Step =
  | { kind: 'action'; action: Action }
  | { kind: 'skill'; skill: SkillId }

/**
 * Every skill Robo has been taught, by name. A skill missing from the book is one
 * Robo does not know yet, so the child has to break it down.
 */
export type SkillBook = Record<SkillId, Step[]>

/**
 * Where a step sits in the tree, as step numbers from the goal down.
 * [1, 0] is the first step of the goal's second step.
 */
export type StepPath = number[]

/** One basic action Robo performed, and the world right after it. The UI plays these back. */
export type RunStep = {
  path: StepPath
  action: Action
  world: World
}

export type RunFailure =
  | { kind: 'actionFailed'; path: StepPath; reason: FailureReason }
  | { kind: 'unknownSkill'; path: StepPath; skill: SkillId }
  | { kind: 'loop'; path: StepPath; skill: SkillId }

export type RunResult =
  | { ok: true; steps: RunStep[]; world: World }
  | { ok: false; steps: RunStep[]; failure: RunFailure }

/** Shorthands for writing skill books by hand, in levels and tests. */
export const doAction = (action: Action): Step => ({ kind: 'action', action })
export const doSkill = (skill: SkillId): Step => ({ kind: 'skill', skill })

/**
 * Runs a skill from the book against a world, one basic action at a time,
 * and stops at the first failure. Never changes the book or the world it was given.
 */
export function runSkill(book: SkillBook, goal: SkillId, world: World): RunResult {
  const steps: RunStep[] = []
  let current = world

  /** Runs one skill. Returns why it failed, or null if every step worked. */
  function runInside(skill: SkillId, path: StepPath, running: SkillId[]): RunFailure | null {
    if (running.includes(skill)) return { kind: 'loop', path, skill }

    const skillSteps: Step[] | undefined = book[skill]
    if (!skillSteps) return { kind: 'unknownSkill', path, skill }

    for (const [index, step] of skillSteps.entries()) {
      const stepPath = [...path, index]

      if (step.kind === 'skill') {
        const failure = runInside(step.skill, stepPath, [...running, skill])
        if (failure) return failure
        continue
      }

      const result = applyAction(current, step.action)
      if (!result.ok) return { kind: 'actionFailed', path: stepPath, reason: result.reason }
      current = result.world
      steps.push({ path: stepPath, action: step.action, world: current })
    }
    return null
  }

  const failure = runInside(goal, [], [])
  return failure ? { ok: false, steps, failure } : { ok: true, steps, world: current }
}
