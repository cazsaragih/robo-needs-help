import type { ReactNode } from 'react'
import { doSkill } from '../core/skills.ts'
import type { SkillBook, SkillId, Step, StepPath } from '../core/skills.ts'
import { SkillCard } from './SkillCard.tsx'
import type { CardState } from './SkillCard.tsx'
import styles from './SkillTree.module.css'

type SkillTreeProps = {
  book: SkillBook
  goal: SkillId
  /** The step Robo is doing right now. */
  runningPath?: StepPath
  /** The step where Robo got stuck. */
  failedPath?: StepPath
}

/** A goal and everything it is made of, drawn by looking up each skill's name in the book. */
export function SkillTree({ book, goal, runningPath, failedPath }: SkillTreeProps) {
  return (
    <ol className={styles.tree} role="list" aria-label="Robo's plan">
      <StepNode
        book={book}
        step={doSkill(goal)}
        path={[]}
        inside={[]}
        runningPath={runningPath}
        failedPath={failedPath}
      />
    </ol>
  )
}

type StepNodeProps = {
  book: SkillBook
  step: Step
  path: StepPath
  /** The skills this step is inside, so a skill that uses itself isn't drawn forever. */
  inside: SkillId[]
  runningPath?: StepPath
  failedPath?: StepPath
}

/** One card, and for a skill, the steps it is made of underneath. */
function StepNode({ book, step, path, inside, runningPath, failedPath }: StepNodeProps) {
  let below: ReactNode = null

  if (step.kind === 'skill') {
    const parts: Step[] | undefined = book[step.skill]

    if (inside.includes(step.skill)) {
      below = <p className={styles.note}>This uses itself, so Robo would never finish.</p>
    } else if (!parts) {
      below = <p className={styles.note}>❓ What is that made of?</p>
    } else {
      below = (
        <ol className={styles.parts} role="list">
          {parts.map((part, index) => (
            <StepNode
              key={index}
              book={book}
              step={part}
              path={[...path, index]}
              inside={[...inside, step.skill]}
              runningPath={runningPath}
              failedPath={failedPath}
            />
          ))}
        </ol>
      )
    }
  }

  return (
    <li className={styles.node}>
      <SkillCard step={step} state={cardState(path, runningPath, failedPath)} />
      {below}
    </li>
  )
}

function cardState(path: StepPath, runningPath?: StepPath, failedPath?: StepPath): CardState {
  if (failedPath && samePath(path, failedPath)) return 'failed'
  if (runningPath && samePath(path, runningPath)) return 'running'
  return 'idle'
}

function samePath(a: StepPath, b: StepPath): boolean {
  return a.length === b.length && a.every((n, i) => n === b[i])
}
