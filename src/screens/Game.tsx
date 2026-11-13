import { useState } from 'react'
import type { SkillBook } from '../core/skills.ts'
import { levels } from '../levels/index.ts'
import { LevelScreen } from './LevelScreen.tsx'

type GameProps = {
  /** How long each step stays lit while Robo runs the plan, in milliseconds. */
  stepDelay?: number
}

/**
 * The whole game: which level is open, which are solved, and one skill book shared by every
 * level, so a skill taught once stays taught.
 */
export function Game({ stepDelay }: GameProps) {
  const [current, setCurrent] = useState(0)
  const [book, setBook] = useState<SkillBook>({})
  const [solved, setSolved] = useState<number[]>([])

  const level = levels[current]
  const isUnlocked = (index: number) => index === 0 || solved.includes(index - 1)

  // The goals of other solved levels are skills Robo already knows. They are shown folded.
  const known = solved.filter((index) => index !== current).map((index) => levels[index].goal)

  return (
    <>
      <div className="level-banner">
        <nav aria-label="Levels">
          <ol className="level-chips" role="list">
            {levels.map((_, index) => {
              const done = solved.includes(index)
              const locked = !isUnlocked(index)
              return (
                <li key={index}>
                  <button
                    type="button"
                    className="level-chip"
                    aria-current={index === current ? 'step' : undefined}
                    aria-label={`Level ${index + 1}${done ? ', done' : ''}${locked ? ', locked' : ''}`}
                    disabled={locked}
                    onClick={() => setCurrent(index)}
                  >
                    {index + 1}
                    {done && <span aria-hidden="true"> ✓</span>}
                    {locked && <span aria-hidden="true"> 🔒</span>}
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
        <h2 className="level-goal">
          Help Robo <strong>{level.goal}</strong>
        </h2>
      </div>

      {/* A new key for each level starts it fresh: no old run or highlights carry over. */}
      <LevelScreen
        key={current}
        level={level}
        book={book}
        onBookChange={setBook}
        known={known}
        onSolved={() => setSolved((before) => (before.includes(current) ? before : [...before, current]))}
        onNext={current + 1 < levels.length ? () => setCurrent(current + 1) : undefined}
        stepDelay={stepDelay}
      />
    </>
  )
}
