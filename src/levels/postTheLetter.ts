// Level 1: Robo needs to post a letter.
// The gentlest start: two ideas and no obstacle. The child learns to break a goal into ideas,
// and ideas into basic actions, and meets the pattern "find something, then carry it somewhere".

import type { Level } from '../core/level.ts'
import { doAction, doSkill } from '../core/skills.ts'

export const postTheLetter: Level = {
  goal: 'post the letter',
  start: {
    roboAt: 'house',
    items: { letter: { at: 'house', hidden: true } },
    paths: [{ between: ['house', 'meadow'] }, { between: ['meadow', 'postbox'] }],
  },
  target: { items: { letter: 'postbox' } },
  checks: {
    'find the letter': { seen: ['letter'] },
    'carry the letter to the postbox': { items: { letter: 'postbox' } },
    // There is no stamp anywhere, so this idea never works out.
    'buy a stamp': { seen: ['stamp'] },
  },
  map: {
    house: { x: 22, y: 40 },
    meadow: { x: 50, y: 68 },
    postbox: { x: 80, y: 40 },
  },
  cards: [
    // Ideas. The first two solve the level; "buy a stamp" is a dead end (see its check above).
    doSkill('find the letter'),
    doSkill('carry the letter to the postbox'),
    doSkill('buy a stamp'),

    // Basic actions Robo already knows.
    doAction({ kind: 'move', to: 'house' }),
    doAction({ kind: 'move', to: 'meadow' }),
    doAction({ kind: 'move', to: 'postbox' }),
    doAction({ kind: 'look' }),
    doAction({ kind: 'pickUp', item: 'letter' }),
    doAction({ kind: 'putDown' }),
  ],
}
