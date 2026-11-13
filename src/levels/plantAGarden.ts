// Level 3: Robo needs to plant a garden on the other side of the river.
// The river is the same as in level 2, so "cross the river", taught there, is a single card here.
// This level only unlocks once level 2 is solved, so the child always arrives knowing it.

import type { Level } from '../core/level.ts'
import { doAction, doSkill } from '../core/skills.ts'

export const plantAGarden: Level = {
  goal: 'plant a garden',
  start: {
    roboAt: 'meadow',
    items: {
      log: { at: 'forest', hidden: true },
      seeds: { at: 'shed', hidden: true },
    },
    paths: [
      // The same river as level 2...
      { between: ['meadow', 'forest'] },
      { between: ['meadow', 'riverbank'] },
      { between: ['riverbank', 'farBank'], needs: { item: 'log', at: 'riverbank' } },
      // ...with a shed and a garden on the other side.
      { between: ['farBank', 'shed'] },
      { between: ['farBank', 'garden'] },
    ],
  },
  target: { items: { seeds: 'garden' } },
  checks: {
    'cross the river': { roboAt: 'farBank' },
    'find the seeds': { seen: ['seeds'] },
    'plant the seeds': { items: { seeds: 'garden' } },
    // Robo can't change the weather, so this idea never works out.
    'make it rain': { seen: ['rain'] },
  },
  map: {
    forest: { x: 12, y: 30 },
    meadow: { x: 27, y: 72 },
    riverbank: { x: 47, y: 50 },
    farBank: { x: 70, y: 50 },
    shed: { x: 87, y: 22 },
    garden: { x: 86, y: 80 },
  },
  cards: [
    // Ideas. "Cross the river" is the skill taught in level 2.
    doSkill('cross the river'),
    doSkill('find the seeds'),
    doSkill('plant the seeds'),
    doSkill('make it rain'),

    // Basic actions for the new part of the problem.
    doAction({ kind: 'move', to: 'farBank' }),
    doAction({ kind: 'move', to: 'shed' }),
    doAction({ kind: 'move', to: 'garden' }),
    doAction({ kind: 'look' }),
    doAction({ kind: 'pickUp', item: 'seeds' }),
    doAction({ kind: 'putDown' }),
  ],
}
