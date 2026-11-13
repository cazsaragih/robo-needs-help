import type { Step } from '../core/skills.ts'
import { cardIcon, cardLabel } from './cardText.ts'
import styles from './SkillCard.module.css'

export type CardState = 'idle' | 'running' | 'failed'

type SkillCardProps = {
  step: Step
  state?: CardState
}

/** One step shown as a card: an icon and a label. Idea cards and action cards look different. */
export function SkillCard({ step, state = 'idle' }: SkillCardProps) {
  return (
    <div
      className={styles.card}
      data-kind={step.kind}
      data-state={state}
      aria-current={state === 'running' ? 'step' : undefined}
    >
      <span className={styles.icon} aria-hidden="true">
        {cardIcon(step)}
      </span>
      <span>{cardLabel(step)}</span>
      {state === 'failed' && <span className={styles.screenReaderOnly}>(Robo got stuck here)</span>}
    </div>
  )
}
