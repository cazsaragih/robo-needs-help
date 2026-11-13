import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import type { SkillBook } from '../core/skills.ts'
import { crossTheRiver } from '../levels/crossTheRiver.ts'
import { LevelScreen } from './LevelScreen.tsx'

const plan = () => within(screen.getByRole('list', { name: "Robo's plan" }))
const cards = () => within(screen.getByRole('region', { name: /made of\?$/ }))

/** Holds the skill book, as the game does, so the level screen can be tested on its own. */
function Harness({ stepDelay }: { stepDelay: number }) {
  const [book, setBook] = useState<SkillBook>({})
  return <LevelScreen level={crossTheRiver} book={book} onBookChange={setBook} stepDelay={stepDelay} />
}

function setUp(stepDelay = 0) {
  const user = userEvent.setup()
  render(<Harness stepDelay={stepDelay} />)

  /** Chooses a skill in the plan, then adds cards to it from the tray. */
  async function teach(skill: string, ...cardNames: string[]) {
    await user.click(plan().getByRole('button', { name: skill }))
    for (const name of cardNames) {
      await user.click(cards().getByRole('button', { name }))
    }
  }

  const run = () => user.click(screen.getByRole('button', { name: 'Go!' }))

  return { user, teach, run }
}

test('starts by asking what the goal is made of', () => {
  setUp()

  expect(screen.getByRole('heading', { name: 'What is “Cross the river” made of?' })).toBeInTheDocument()
  expect(plan().getByText('❓ What is that made of?')).toBeInTheDocument()
})

test('the child can break a goal down, then break down a step', async () => {
  const { teach } = setUp()

  await teach('Cross the river', 'Find a log')
  expect(plan().getByRole('button', { name: 'Find a log' })).toBeInTheDocument()

  await teach('Find a log', 'Go to the forest')
  expect(screen.getByRole('heading', { name: 'What is “Find a log” made of?' })).toBeInTheDocument()
  expect(plan().getByText('Go to the forest')).toBeInTheDocument()
})

test('the child can take a step out again', async () => {
  const { user, teach } = setUp()

  await teach('Cross the river', 'Build a boat')
  await user.click(plan().getByRole('button', { name: 'Remove Build a boat' }))

  expect(plan().queryByText('Build a boat')).not.toBeInTheDocument()
  expect(plan().getByText('❓ What is that made of?')).toBeInTheDocument()
})

test('works with the keyboard alone', async () => {
  const { user } = setUp()

  await user.tab() // the Go button
  await user.tab() // the goal card in the plan
  await user.tab() // the first card in the tray
  await user.keyboard('{Enter}')

  expect(plan().getByRole('button', { name: 'Find a log' })).toBeInTheDocument()
})

test('running with nothing taught, Robo asks about the goal', async () => {
  const { run } = setUp()

  await run()

  expect(await screen.findByText("I don't know how to cross the river. What is that made of?")).toBeInTheDocument()
})

test('Robo says where it got stuck, and the step is marked', async () => {
  const { teach, run } = setUp()
  await teach('Cross the river', 'Walk across')
  await teach('Walk across', 'Go to the river', 'Go to the other side')

  await run()

  expect(await screen.findByText("I can't get across. Something is missing.")).toBeInTheDocument()
  expect(plan().getByText('(Robo got stuck here)').parentElement).toHaveTextContent('Go to the other side')
})

test('Robo says what an idea is missing, and the idea is marked', async () => {
  const { teach, run } = setUp()
  await teach('Cross the river', 'Find a log')
  await teach('Find a log', 'Go to the forest')

  await run()

  expect(await screen.findByText('I did "find a log", but I can\'t see the log.')).toBeInTheDocument()
  expect(plan().getByText('(Robo got stuck here)').parentElement).toHaveTextContent('Find a log')
})

test('Robo says when every step worked but the goal is not reached', async () => {
  const { teach, run } = setUp()
  await teach('Cross the river', 'Find a log')
  await teach('Find a log', 'Go to the forest', 'Look around')

  await run()

  expect(await screen.findByText(/I did every step, but I still haven't managed to cross the river/)).toBeInTheDocument()
})

test('the child can solve the river level', async () => {
  const { teach, run } = setUp()
  await teach('Cross the river', 'Find a log', 'Carry the log to the river', 'Walk across')
  await teach('Find a log', 'Go to the forest', 'Look around')
  await teach('Carry the log to the river', 'Pick up the log', 'Go to the meadow', 'Go to the river', 'Put down')
  await teach('Walk across', 'Go to the other side')

  await run()

  expect(await screen.findByText('I did it! Now I know how to cross the river.')).toBeInTheDocument()
})

test('the plan cannot be changed while Robo is running it', async () => {
  const { teach, run } = setUp(10_000)
  await teach('Cross the river', 'Walk across')
  await teach('Walk across', 'Go to the river', 'Go to the other side')

  await run()

  expect(screen.getByText('Here I go!')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Go!' })).toBeDisabled()
  expect(cards().getByRole('button', { name: 'Look around' })).toBeDisabled()
  expect(plan().queryByRole('button', { name: /Remove/ })).not.toBeInTheDocument()
  expect(plan().getByText('Go to the river').parentElement).toHaveAttribute('aria-current', 'step')
})
