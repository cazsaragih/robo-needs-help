import { useRef, useState } from 'react'
import type { SkillBook } from '../core/skills.ts'
import { levels } from '../levels/index.ts'
import { Finale } from './Finale.tsx'
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
  // Goes up on "Start over", so every level screen starts completely fresh.
  const [round, setRound] = useState(0)
  const top = useRef<HTMLDivElement>(null)

  const level = levels[current]
  const isUnlocked = (index: number) => index === 0 || solved.includes(index - 1)
  const finished = solved.length === levels.length

  // The goals of other solved levels are skills Robo already knows. They are shown folded.
  const known = solved.filter((index) => index !== current).map((index) => levels[index].goal)

  /** Opens a level, scrolled to its top. */
  function openLevel(index: number) {
    setCurrent(index)
    top.current?.scrollIntoView?.({ block: 'start' })
  }

  function startOver() {
    setCurrent(0)
    setBook({})
    setSolved([])
    setRound(round + 1)
  }

  return (
    <>
      {finished && (
        <Finale
          goals={levels.map((each) => each.goal)}
          skillCount={Object.keys(book).length}
          onStartOver={startOver}
        />
      )}

      <div className="level-banner" ref={top}>
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
                    onClick={() => openLevel(index)}
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

      {/* A new key for each level (and each round) starts it fresh: no old run or highlights carry over. */}
      <LevelScreen
        key={`${round}-${current}`}
        level={level}
        book={book}
        onBookChange={setBook}
        known={known}
        onSolved={() => setSolved((before) => (before.includes(current) ? before : [...before, current]))}
        onNext={current + 1 < levels.length ? () => openLevel(current + 1) : undefined}
        stepDelay={stepDelay}
      />
    </>
  )
}
