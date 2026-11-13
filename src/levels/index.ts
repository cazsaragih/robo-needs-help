// The levels, in the order children play them. Each unlocks when the one before it is solved.

import type { Level } from '../core/level.ts'
import { crossTheRiver } from './crossTheRiver.ts'
import { postTheLetter } from './postTheLetter.ts'
import { plantAGarden } from './plantAGarden.ts'

export const levels: Level[] = [postTheLetter, crossTheRiver, plantAGarden]
