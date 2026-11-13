import { RoboHead } from './Robo.tsx'
import styles from './RoboSays.module.css'

type RoboSaysProps = {
  /** What Robo says. Empty means Robo is quiet. */
  text: string
}

/**
 * Robo's speech bubble. It is always on the page, even when empty, so screen readers
 * announce each new sentence as it appears.
 */
export function RoboSays({ text }: RoboSaysProps) {
  return (
    <div className={styles.robo}>
      <svg className={styles.face} viewBox="-48 -64 96 100" aria-hidden="true">
        <RoboHead />
      </svg>
      <p className={styles.bubble} role="status" data-empty={text === ''}>
        {text}
      </p>
    </div>
  )
}
