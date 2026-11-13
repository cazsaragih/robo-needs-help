// Level 1: Robo needs to get across the river.
// The child learns to break a goal into ideas, and ideas into basic actions.

import type { Level } from '../core/level.ts'
import { doAction, doSkill } from '../core/skills.ts'

export const level1: Level = {
  goal: 'cross the river',
  start: {
    roboAt: 'meadow',
    items: { log: { at: 'forest', hidden: true } },
    paths: [
      { between: ['meadow', 'forest'] },
      { between: ['meadow', 'riverbank'] },
      { between: ['riverbank', 'farBank'], needs: { item: 'log', at: 'riverbank' } },
    ],
  },
  target: { roboAt: 'farBank' },
  cards: [
    // Ideas. The first three solve the level; "build a boat" is a dead end.
    doSkill('find a log'),
    doSkill('carry the log to the river'),
    doSkill('walk across'),
    doSkill('build a boat'),

    // Basic actions Robo already knows.
    doAction({ kind: 'move', to: 'meadow' }),
    doAction({ kind: 'move', to: 'forest' }),
    doAction({ kind: 'move', to: 'riverbank' }),
    doAction({ kind: 'move', to: 'farBank' }),
    doAction({ kind: 'look' }),
    doAction({ kind: 'pickUp', item: 'log' }),
    doAction({ kind: 'putDown' }),
  ],
}
