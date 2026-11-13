import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { level1 } from '../levels/level1.ts'
import { LevelScreen } from './LevelScreen.tsx'

const plan = () => within(screen.getByRole('list', { name: "Robo's plan" }))
const cards = () => within(screen.getByRole('list', { name: 'Cards' }))

test('starts by asking what the goal is made of', () => {
  render(<LevelScreen level={level1} />)

  expect(screen.getByRole('heading', { name: 'What is “Cross the river” made of?' })).toBeInTheDocument()
  expect(plan().getByText('❓ What is that made of?')).toBeInTheDocument()
})

test('the child can break a goal down, then break down a step', async () => {
  const user = userEvent.setup()
  render(<LevelScreen level={level1} />)

  // Cross the river is made of "find a log"...
  await user.click(cards().getByRole('button', { name: 'Find a log' }))
  expect(plan().getByRole('button', { name: 'Find a log' })).toBeInTheDocument()

  // ...and "find a log" is made of "go to the forest".
  await user.click(plan().getByRole('button', { name: 'Find a log' }))
  expect(screen.getByRole('heading', { name: 'What is “Find a log” made of?' })).toBeInTheDocument()

  await user.click(cards().getByRole('button', { name: 'Go to the forest' }))
  expect(plan().getByText('Go to the forest')).toBeInTheDocument()
})

test('the child can take a step out again', async () => {
  const user = userEvent.setup()
  render(<LevelScreen level={level1} />)

  await user.click(cards().getByRole('button', { name: 'Build a boat' }))
  await user.click(plan().getByRole('button', { name: 'Remove Build a boat' }))

  expect(plan().queryByText('Build a boat')).not.toBeInTheDocument()
  expect(plan().getByText('❓ What is that made of?')).toBeInTheDocument()
})

test('works with the keyboard alone', async () => {
  const user = userEvent.setup()
  render(<LevelScreen level={level1} />)

  await user.tab() // the goal card in the plan
  await user.tab() // the first card in the tray
  await user.keyboard('{Enter}')

  expect(plan().getByRole('button', { name: 'Find a log' })).toBeInTheDocument()
})
