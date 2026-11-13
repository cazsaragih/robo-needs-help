import { useEffect, useState } from 'react'
import { cardLabel } from '../components/cardText.ts'
import { RoboSays } from '../components/RoboSays.tsx'
import { roboSays } from '../components/roboSpeech.ts'
import { SkillCard } from '../components/SkillCard.tsx'
import { SkillTree } from '../components/SkillTree.tsx'
import { WorldView } from '../components/WorldView.tsx'
import type { RoboMood } from '../components/WorldView.tsx'
import { playLevel } from '../core/level.ts'
import type { Level, LevelOutcome } from '../core/level.ts'
import { addStep, doSkill, removeStep } from '../core/skills.ts'
import type { SkillBook, SkillId, Step } from '../core/skills.ts'

type LevelScreenProps = {
  level: Level
  /** The level's number, shown in the banner. */
  number: number
  /** How long each step stays lit while Robo runs the plan, in milliseconds. */
  stepDelay?: number
}

/** A run being played back: the outcome, and how many of its steps have been shown so far. */
type Run = { outcome: LevelOutcome; shown: number }

/** One level: the child builds Robo's plan, runs it, sees where it fails, and fixes it. */
export function LevelScreen({ level, number, stepDelay = 900 }: LevelScreenProps) {
  const [book, setBook] = useState<SkillBook>({})
  const [teaching, setTeaching] = useState<SkillId>(level.goal)
  const [run, setRun] = useState<Run | null>(null)

  const playing = run !== null && run.shown < run.outcome.steps.length
  const finished = run !== null && !playing

  // While a run is playing, move on to the next step after a short pause.
  useEffect(() => {
    if (!run || !playing) return
    const timer = setTimeout(() => setRun({ ...run, shown: run.shown + 1 }), stepDelay)
    return () => clearTimeout(timer)
  }, [run, playing, stepDelay])

  /** Any change to the plan clears the last run, so old highlights never point at the wrong card. */
  function changeBook(next: SkillBook) {
    setBook(next)
    setRun(null)
  }

  const outcome = run?.outcome
  const current = run && playing ? run.outcome.steps[run.shown] : undefined
  const runningPath = current?.path
  const failedPath = finished && outcome?.kind === 'stuck' ? outcome.failure.path : undefined

  // The scene shows the world after the step being played, or after the last step once the run is over.
  const shownWorld = current?.world ?? (finished ? outcome?.steps.at(-1)?.world : undefined) ?? level.start

  let mood: RoboMood = 'idle'
  if (playing) mood = 'busy'
  else if (outcome) mood = outcome.kind === 'solved' ? 'happy' : 'confused'

  let speech = ''
  if (playing) speech = 'Here I go!'
  else if (outcome) speech = roboSays(outcome, level)

  const ideas = level.cards.filter((card) => card.kind === 'skill')
  const actions = level.cards.filter((card) => card.kind === 'action')

  function tray(label: string, cards: Step[]) {
    return (
      <>
        <p className="tray-label">{label}</p>
        <ul className="card-tray" role="list" aria-label={label}>
          {cards.map((card, index) => (
            <li key={index}>
              <button
                type="button"
                className="card-button"
                disabled={playing}
                onClick={() => changeBook(addStep(book, teaching, card))}
              >
                <SkillCard step={card} />
              </button>
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <>
      <div className="level-banner">
        <span className="level-chip">Level {number}</span>
        <h2 className="level-goal">
          Help Robo <strong>{level.goal}</strong>
        </h2>
      </div>

      <div className="level">
        <div className="stage">
          <WorldView
            world={shownWorld}
            map={level.map}
            goalPlace={level.target.roboAt}
            action={current?.action}
            mood={mood}
            beat={run?.shown ?? -1}
            moveDuration={stepDelay * 0.8}
          />
          <div className="go-bar">
            <button
              type="button"
              className="go-button"
              disabled={playing}
              onClick={() => setRun({ outcome: playLevel(level, book), shown: 0 })}
            >
              <span aria-hidden="true">▶</span> Go!
            </button>
            <RoboSays text={speech} />
          </div>
        </div>

        <div className="workbench">
          <section className="panel" aria-labelledby="plan-heading">
            <h3 id="plan-heading">Robo's plan</h3>
            <SkillTree
              book={book}
              goal={level.goal}
              runningPath={runningPath}
              failedPath={failedPath}
              teaching={teaching}
              onTeach={playing ? undefined : setTeaching}
              onRemove={playing ? undefined : (skill, index) => changeBook(removeStep(book, skill, index))}
            />
          </section>

          <section className="panel" aria-labelledby="cards-heading">
            <h3 id="cards-heading">What is “{cardLabel(doSkill(teaching))}” made of?</h3>
            {tray('Ideas', ideas)}
            {tray('Robo knows how to', actions)}
          </section>
        </div>
      </div>
    </>
  )
}
