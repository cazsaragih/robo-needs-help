import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import App from './App.tsx'

test('shows the game title as the page heading', () => {
  render(<App />)

  expect(
    screen.getByRole('heading', { level: 1, name: 'Robo needs help' }),
  ).toBeInTheDocument()
})

test('levels unlock in order, and a skill taught in level 2 is ready in level 3', async () => {
  const user = userEvent.setup()
  render(<App stepDelay={0} />)
  const plan = () => within(screen.getByRole('list', { name: "Robo's plan" }))
  const cards = () => within(screen.getByRole('region', { name: /made of\?$/ }))
  const teach = async (skill: string, ...names: string[]) => {
    await user.click(plan().getByRole('button', { name: skill }))
    for (const name of names) await user.click(cards().getByRole('button', { name }))
  }

  expect(screen.getByRole('button', { name: 'Level 3, locked' })).toBeDisabled()

  // Level 1: post the letter.
  expect(screen.getByRole('heading', { name: 'Help Robo post the letter' })).toBeInTheDocument()
  await teach('Post the letter', 'Find the letter', 'Carry the letter to the postbox')
  await teach('Find the letter', 'Look around')
  await teach('Carry the letter to the postbox', 'Pick up the letter', 'Go to the meadow', 'Go to the postbox', 'Put down')
  await user.click(screen.getByRole('button', { name: 'Go!' }))
  await user.click(await screen.findByRole('button', { name: 'Next level' }))

  // Level 2: cross the river.
  expect(screen.getByRole('heading', { name: 'Help Robo cross the river' })).toBeInTheDocument()
  await teach('Cross the river', 'Find a log', 'Carry the log to the river', 'Walk across')
  await teach('Find a log', 'Go to the forest', 'Look around')
  await teach('Carry the log to the river', 'Pick up the log', 'Go to the meadow', 'Go to the river', 'Put down')
  await teach('Walk across', 'Go to the other side')
  await user.click(screen.getByRole('button', { name: 'Go!' }))
  await user.click(await screen.findByRole('button', { name: 'Next level' }))

  // Level 3: "cross the river" is one card, and Robo already knows it.
  expect(screen.getByRole('heading', { name: 'Help Robo plant a garden' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Level 2, done' })).toBeInTheDocument()
  await teach('Plant a garden', 'Cross the river')

  expect(plan().getByText('✓ Robo already knows this')).toBeInTheDocument()
  expect(plan().queryByText('Find a log')).not.toBeInTheDocument()
})
