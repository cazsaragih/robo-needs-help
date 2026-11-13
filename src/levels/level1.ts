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
  checks: {
    'find a log': { seen: ['log'] },
    'carry the log to the river': { items: { log: 'riverbank' } },
    'walk across': { roboAt: 'farBank' },
    // There is no boat, and no card can make one, so this idea never works out.
    'build a boat': { items: { boat: 'riverbank' } },
  },
  map: {
    forest: { x: 15, y: 32 },
    meadow: { x: 35, y: 68 },
    riverbank: { x: 60, y: 52 },
    farBank: { x: 87, y: 42 },
  },
  cards: [
    // Ideas. The first three solve the level; "build a boat" is a dead end (see its check above).
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
