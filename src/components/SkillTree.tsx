import type { ReactNode } from 'react'
import { doSkill } from '../core/skills.ts'
import type { SkillBook, SkillId, Step, StepPath } from '../core/skills.ts'
import { cardLabel } from './cardText.ts'
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
  /** The skill the child is teaching right now. Its card is shown as chosen. */
  teaching?: SkillId
  /** Called when the child taps a skill to teach it. Without it, skills can't be chosen. */
  onTeach?: (skill: SkillId) => void
  /** Called when the child removes a step from a skill. Without it, there are no remove buttons. */
  onRemove?: (skill: SkillId, index: number) => void
  /**
   * Skills Robo learned in earlier levels. They are drawn folded, as one card, and light up
   * as a whole while Robo runs any step inside them.
   */
  known?: SkillId[]
}

/** A goal and everything it is made of, drawn by looking up each skill's name in the book. */
export function SkillTree(props: SkillTreeProps) {
  return (
    <ol className={styles.tree} role="list" aria-label="Robo's plan">
      <StepNode tree={props} step={doSkill(props.goal)} path={[]} inside={[]} />
    </ol>
  )
}

type StepNodeProps = {
  /** Everything the tree was given, passed down unchanged. */
  tree: SkillTreeProps
  step: Step
  path: StepPath
  /** The skills this step is inside, from the goal down. The last one is the skill it belongs to. */
  inside: SkillId[]
}

/** One card, and for a skill, the steps it is made of underneath. */
function StepNode({ tree, step, path, inside }: StepNodeProps) {
  const { book, teaching, onTeach, onRemove, known = [] } = tree
  const parts: Step[] | undefined = step.kind === 'skill' ? book[step.skill] : undefined
  const folded = step.kind === 'skill' && parts !== undefined && known.includes(step.skill)

  let card: ReactNode = <SkillCard step={step} state={cardState(path, tree, folded)} />
  let below: ReactNode = null

  if (step.kind === 'skill') {
    const skill = step.skill

    if (onTeach && !folded) {
      card = (
        <button
          type="button"
          className={styles.teach}
          aria-pressed={teaching === skill}
          onClick={() => onTeach(skill)}
        >
          {card}
        </button>
      )
    }

    if (inside.includes(skill)) {
      below = <p className={styles.note}>This uses itself, so Robo would never finish.</p>
    } else if (!parts) {
      below = <p className={styles.note}>❓ What is that made of?</p>
    } else if (folded) {
      below = <p className={styles.known}>✓ Robo already knows this</p>
    } else {
      below = (
        <ol className={styles.parts} role="list">
          {parts.map((part, index) => (
            <StepNode key={index} tree={tree} step={part} path={[...path, index]} inside={[...inside, skill]} />
          ))}
        </ol>
      )
    }
  }

  const parent = inside.at(-1)
  const index = path.at(-1)

  return (
    <li className={styles.node}>
      <div className={styles.row}>
        {card}
        {onRemove && parent !== undefined && index !== undefined && (
          <button
            type="button"
            className={styles.remove}
            aria-label={`Remove ${cardLabel(step)}`}
            onClick={() => onRemove(parent, index)}
          >
            ✕
          </button>
        )}
      </div>
      {below}
    </li>
  )
}

/** A folded card stands for everything inside it, so it also lights up for steps deeper down. */
function cardState(path: StepPath, { runningPath, failedPath }: SkillTreeProps, folded: boolean): CardState {
  const marks = (other?: StepPath) =>
    other !== undefined && (folded ? isInside(other, path) : samePath(other, path))
  if (marks(failedPath)) return 'failed'
  if (marks(runningPath)) return 'running'
  return 'idle'
}

function samePath(a: StepPath, b: StepPath): boolean {
  return a.length === b.length && a.every((n, i) => n === b[i])
}

/** True when `path` is `outer` or a step somewhere inside it. */
function isInside(path: StepPath, outer: StepPath): boolean {
  return outer.length <= path.length && outer.every((n, i) => n === path[i])
}
