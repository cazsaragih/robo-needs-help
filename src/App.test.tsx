import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App.tsx'

test('shows the game title as the page heading', () => {
  render(<App />)

  expect(
    screen.getByRole('heading', { level: 1, name: 'Robo needs help' }),
  ).toBeInTheDocument()
})
