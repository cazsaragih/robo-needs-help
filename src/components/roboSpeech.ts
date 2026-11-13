// What Robo says after a run. The core reports codes; this turns them into words a
// young child can follow, and later into voice-over.

import type { Level, LevelOutcome, Target } from '../core/level.ts'
import type { FailureReason, World } from '../core/world.ts'
import { isOrAre, placeName } from './cardText.ts'

const whyStuck: Record<FailureReason, string> = {
  noPath: "I can't get there from here.",
  pathBlocked: "I can't get across. Something is missing.",
  itemNotHere: "I can't find that here.",
  itemNotSeen: "I can't see it. Maybe I should look around first?",
  handsFull: 'My hands are full!',
  handsEmpty: "I'm not holding anything.",
}

export function roboSays(outcome: LevelOutcome, level: Level): string {
  const goal = level.goal
  switch (outcome.kind) {
    case 'solved':
      return `I did it! Now I know how to ${goal}.`
    case 'notThereYet':
      return `I did every step, but I still haven't managed to ${goal}. Is a step missing?`
    case 'stuck': {
      const { failure } = outcome
      switch (failure.kind) {
        case 'unknownSkill':
          return `I don't know how to ${failure.skill}. What is that made of?`
        case 'loop':
          return `"${failure.skill}" uses itself, so I would never finish!`
        case 'actionFailed':
          return whyStuck[failure.reason]
        case 'notDone': {
          const world = outcome.steps.at(-1)?.world ?? level.start
          const check: Target | undefined = level.checks[failure.skill]
          const missing = check ? whatIsMissing(world, check) : "it didn't work out"
          return `I did "${failure.skill}", but ${missing}.`
        }
      }
    }
  }
}

/** The first part of a target that isn't true yet, as the end of one of Robo's sentences. */
function whatIsMissing(world: World, target: Target): string {
  if (target.roboAt !== undefined && world.roboAt !== target.roboAt) {
    return `I'm not at ${placeName(target.roboAt)}`
  }
  for (const id of target.seen ?? []) {
    const item = world.items[id]
    if (item === undefined || item.hidden) return `I can't see the ${id}`
  }
  for (const [id, place] of Object.entries(target.items ?? {})) {
    if (world.items[id]?.at !== place) return `the ${id} ${isOrAre(id)}n't at ${placeName(place)}`
  }
  return "it didn't work out"
}
