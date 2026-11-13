// Shared test data: a small version of the river level.
// Each function returns a fresh copy, so one test can never affect another.

import { doAction, doSkill } from './skills.ts'
import type { SkillBook } from './skills.ts'
import type { World } from './world.ts'

/** The log is hidden in the forest. The river can only be crossed once the log lies on the riverbank. */
export function riverWorld(): World {
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

/** Everything a child would teach Robo to cross the river. */
export function riverSkillBook(): SkillBook {
  return {
    'cross the river': [
      doSkill('find a log'),
      doSkill('carry the log to the river'),
      doSkill('walk across'),
    ],
    'find a log': [doAction({ kind: 'move', to: 'forest' }), doAction({ kind: 'look' })],
    'carry the log to the river': [
      doAction({ kind: 'pickUp', item: 'log' }),
      doAction({ kind: 'move', to: 'meadow' }),
      doAction({ kind: 'move', to: 'riverbank' }),
      doAction({ kind: 'putDown' }),
    ],
    'walk across': [doAction({ kind: 'move', to: 'farBank' })],
  }
}
