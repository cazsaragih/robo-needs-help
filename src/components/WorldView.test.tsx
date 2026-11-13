import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { riverWorld } from '../core/test-fixtures.ts'
import type { World } from '../core/world.ts'
import { WorldView } from './WorldView.tsx'

const map = {
  forest: { x: 15, y: 32 },
  meadow: { x: 35, y: 68 },
  riverbank: { x: 60, y: 52 },
  farBank: { x: 87, y: 42 },
}

function scene() {
  return screen.getByRole('img')
}

test('tells screen readers where Robo is, and nothing about a hidden log', () => {
  render(<WorldView world={riverWorld()} map={map} />)

  expect(scene()).toHaveAccessibleName('Robo is at the meadow.')
})

test('mentions an item once Robo has seen it', () => {
  const world: World = { ...riverWorld(), roboAt: 'forest', items: { log: { at: 'forest', hidden: false } } }
  render(<WorldView world={world} map={map} />)

  expect(scene()).toHaveAccessibleName('Robo is at the forest. The log is at the forest.')
})

test('says what Robo is carrying', () => {
  const world: World = { ...riverWorld(), items: { log: { at: null, hidden: false } } }
  render(<WorldView world={world} map={map} />)

  expect(scene()).toHaveAccessibleName('Robo is at the meadow. Robo is carrying the log.')
})

test('labels every place with the same words and icon as its cards', () => {
  render(<WorldView world={riverWorld()} map={map} />)

  for (const sign of ['🌲 the forest', '🌼 the meadow', '🌊 the river', '🏝️ the other side']) {
    expect(screen.getByText(sign)).toBeInTheDocument()
  }
})
