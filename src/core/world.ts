// The world Robo lives in, and the four basic actions Robo knows.
// Pure TypeScript: no React, no timers, no randomness.

export type PlaceId = string
export type ItemId = string

export type Item = {
  /** Where the item is lying. `null` while Robo is carrying it. */
  at: PlaceId | null
  /** Robo cannot pick up a hidden item until it has looked around. */
  hidden: boolean
}

export type Path = {
  between: [PlaceId, PlaceId]
  /** The path is only open while this item lies at this place, e.g. a log at the river. */
  needs?: { item: ItemId; at: PlaceId }
}

export type World = {
  roboAt: PlaceId
  items: Record<ItemId, Item>
  paths: Path[]
}

/** Robo's first principles. Every skill is built from these in the end. */
export type Action =
  | { kind: 'move'; to: PlaceId }
  | { kind: 'pickUp'; item: ItemId }
  | { kind: 'putDown' }
  | { kind: 'look' }

/** Codes, not sentences: the UI turns them into words, icons and voice-over. */
export type FailureReason =
  | 'noPath'
  | 'pathBlocked'
  | 'itemNotHere'
  | 'itemNotSeen'
  | 'handsFull'
  | 'handsEmpty'

export type ActionResult =
  | { ok: true; world: World }
  | { ok: false; reason: FailureReason }

/** The item Robo is carrying, or `null` if its hands are empty. */
export function carriedItem(world: World): ItemId | null {
  const found = Object.entries(world.items).find(([, item]) => item.at === null)
  return found ? found[0] : null
}

/**
 * Applies one action and returns the new world, or the reason it failed.
 * Never changes the world it was given.
 */
export function applyAction(world: World, action: Action): ActionResult {
  switch (action.kind) {
    case 'move':
      return move(world, action.to)
    case 'pickUp':
      return pickUp(world, action.item)
    case 'putDown':
      return putDown(world)
    case 'look':
      return look(world)
  }
}

function move(world: World, to: PlaceId): ActionResult {
  if (to === world.roboAt) return { ok: true, world }

  const path = world.paths.find(
    ({ between: [a, b] }) =>
      (a === world.roboAt && b === to) || (b === world.roboAt && a === to),
  )
  if (!path) return { ok: false, reason: 'noPath' }

  if (path.needs && world.items[path.needs.item]?.at !== path.needs.at) {
    return { ok: false, reason: 'pathBlocked' }
  }
  return { ok: true, world: { ...world, roboAt: to } }
}

function pickUp(world: World, id: ItemId): ActionResult {
  if (carriedItem(world) !== null) return { ok: false, reason: 'handsFull' }

  const item: Item | undefined = world.items[id]
  if (!item || item.at !== world.roboAt) return { ok: false, reason: 'itemNotHere' }
  if (item.hidden) return { ok: false, reason: 'itemNotSeen' }

  return { ok: true, world: withItem(world, id, { ...item, at: null }) }
}

function putDown(world: World): ActionResult {
  const id = carriedItem(world)
  if (id === null) return { ok: false, reason: 'handsEmpty' }

  return { ok: true, world: withItem(world, id, { hidden: false, at: world.roboAt }) }
}

function look(world: World): ActionResult {
  const items = Object.fromEntries(
    Object.entries(world.items).map(([id, item]) => [
      id,
      item.at === world.roboAt ? { ...item, hidden: false } : item,
    ]),
  )
  return { ok: true, world: { ...world, items } }
}

/** Returns a copy of the world with one item replaced. */
function withItem(world: World, id: ItemId, item: Item): World {
  return { ...world, items: { ...world.items, [id]: item } }
}
