import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { doSkill } from '../core/skills.ts'
import { riverSkillBook } from '../core/test-fixtures.ts'
import { SkillTree } from './SkillTree.tsx'

test('shows the goal and every step it is made of', () => {
  render(<SkillTree book={riverSkillBook()} goal="cross the river" />)

  expect(screen.getByRole('list', { name: "Robo's plan" })).toBeInTheDocument()
  // 1 goal + 3 ideas + 7 basic actions
  expect(screen.getAllByRole('listitem')).toHaveLength(11)
  expect(screen.getByText('Cross the river')).toBeInTheDocument()
  expect(screen.getByText('Carry the log to the river')).toBeInTheDocument()
  expect(screen.getByText('Pick up the log')).toBeInTheDocument()
})

test('asks what a skill is made of when Robo has not been taught it', () => {
  const book = riverSkillBook()
  delete book['walk across']

  render(<SkillTree book={book} goal="cross the river" />)

  expect(screen.getByText('❓ What is that made of?')).toBeInTheDocument()
})

test('stops drawing a skill that uses itself', () => {
  render(<SkillTree book={{ forever: [doSkill('forever')] }} goal="forever" />)

  expect(screen.getByText('This uses itself, so Robo would never finish.')).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
})

test('marks the step Robo is doing and the step where it got stuck', () => {
  render(
    <SkillTree book={riverSkillBook()} goal="cross the river" runningPath={[0, 0]} failedPath={[1, 0]} />,
  )

  expect(screen.getByText('Go to the forest').parentElement).toHaveAttribute('aria-current', 'step')
  expect(screen.getByText('(Robo got stuck here)').parentElement).toHaveTextContent('Pick up the log')
})
