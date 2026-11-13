import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { doAction, doSkill } from '../core/skills.ts'
import { SkillCard } from './SkillCard.tsx'

test('shows a label, with the icon hidden from screen readers', () => {
  render(<SkillCard step={doAction({ kind: 'move', to: 'forest' })} />)

  expect(screen.getByText('Go to the forest')).toBeInTheDocument()
  expect(screen.getByText('🌲')).toHaveAttribute('aria-hidden', 'true')
})

test('starts an idea card with a capital letter', () => {
  render(<SkillCard step={doSkill('find a log')} />)

  expect(screen.getByText('Find a log')).toBeInTheDocument()
})

test('tells screen readers which step Robo is doing', () => {
  render(<SkillCard step={doAction({ kind: 'look' })} state="running" />)

  expect(screen.getByText('Look around').parentElement).toHaveAttribute('aria-current', 'step')
})

test('tells screen readers where Robo got stuck', () => {
  render(<SkillCard step={doAction({ kind: 'look' })} state="failed" />)

  expect(screen.getByText('(Robo got stuck here)')).toBeInTheDocument()
})
