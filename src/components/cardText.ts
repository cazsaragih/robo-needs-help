// Words and icons for cards. Kept out of the core, so the core never deals with
// presentation and the words can later be translated or voiced.

import type { Step } from '../core/skills.ts'
import type { ItemId, PlaceId } from '../core/world.ts'

const places: Record<PlaceId, { name: string; icon: string }> = {
  meadow: { name: 'the meadow', icon: '🌼' },
  forest: { name: 'the forest', icon: '🌲' },
  riverbank: { name: 'the river', icon: '🌊' },
  farBank: { name: 'the other side', icon: '🏝️' },
  house: { name: 'the house', icon: '🏠' },
  postbox: { name: 'the postbox', icon: '📮' },
  shed: { name: 'the shed', icon: '🛖' },
  garden: { name: 'the garden', icon: '🌱' },
}

export const placeName = (id: PlaceId): string => places[id]?.name ?? id
export const placeIcon = (id: PlaceId): string => places[id]?.icon ?? '📍'

/** "is" or "are" to go with an item's name: "the log is", "the seeds are". */
export const isOrAre = (item: ItemId): string => (item.endsWith('s') ? 'are' : 'is')

export function cardLabel(step: Step): string {
  if (step.kind === 'skill') return step.skill.charAt(0).toUpperCase() + step.skill.slice(1)

  switch (step.action.kind) {
    case 'move':
      return `Go to ${placeName(step.action.to)}`
    case 'pickUp':
      return `Pick up the ${step.action.item}`
    case 'putDown':
      return 'Put down'
    case 'look':
      return 'Look around'
  }
}

export function cardIcon(step: Step): string {
  if (step.kind === 'skill') return '💡'

  switch (step.action.kind) {
    case 'move':
      return placeIcon(step.action.to)
    case 'pickUp':
      return '✋'
    case 'putDown':
      return '👇'
    case 'look':
      return '👀'
  }
}
