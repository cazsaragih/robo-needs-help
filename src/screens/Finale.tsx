import { useState } from 'react'
import { RoboHead } from '../components/Robo.tsx'

type FinaleProps = {
  /** The goal of every level, in order. */
  goals: string[]
  /** How many skills the child taught Robo in all. */
  skillCount: number
  onStartOver: () => void
}

const confettiColours = ['#f4a23b', '#2a9d8f', '#d64545', '#f7d046', '#62b878', '#4ea7e6']

/** Shown once every level is solved: what Robo learned, and a way to play again. */
export function Finale({ goals, skillCount, onStartOver }: FinaleProps) {
  // Starting over forgets everything, so it asks once before doing it.
  const [confirming, setConfirming] = useState(false)

  return (
    <section className="finale panel" aria-labelledby="finale-heading">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 7 + 3) % 100}%`,
              background: confettiColours[i % confettiColours.length],
              animationDelay: `${(i % 5) * 0.15}s`,
            }}
          />
        ))}
      </div>

      <svg className="finale-robo" viewBox="-50 -64 100 100" aria-hidden="true">
        <RoboHead />
      </svg>

      <div>
        <h2 id="finale-heading">You helped Robo with everything!</h2>
        <p>
          Robo learned <strong>{skillCount} skills</strong> from you. Now it knows how to:
        </p>
        <ul className="finale-goals">
          {goals.map((goal) => (
            <li key={goal}>
              <span aria-hidden="true">✓ </span>
              {goal}
            </li>
          ))}
        </ul>

        {confirming ? (
          <div className="finale-actions">
            <p>Forget everything Robo learned and start again?</p>
            <button type="button" className="finale-button" onClick={onStartOver}>
              Yes, start over
            </button>
            <button type="button" className="finale-button quiet" onClick={() => setConfirming(false)}>
              No, keep it
            </button>
          </div>
        ) : (
          <div className="finale-actions">
            <button type="button" className="finale-button quiet" onClick={() => setConfirming(true)}>
              Start over
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
