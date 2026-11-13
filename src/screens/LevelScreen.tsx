import { useState } from 'react'
import { cardLabel } from '../components/cardText.ts'
import { SkillCard } from '../components/SkillCard.tsx'
import { SkillTree } from '../components/SkillTree.tsx'
import type { Level } from '../core/level.ts'
import { addStep, doSkill, removeStep } from '../core/skills.ts'
import type { SkillBook, SkillId } from '../core/skills.ts'

type LevelScreenProps = {
  level: Level
}

/** One level: the child builds Robo's plan by choosing a skill to teach and adding cards to it. */
export function LevelScreen({ level }: LevelScreenProps) {
  const [book, setBook] = useState<SkillBook>({})
  const [teaching, setTeaching] = useState<SkillId>(level.goal)

  return (
    <>
      <section aria-labelledby="plan-heading">
        <h2 id="plan-heading">Robo's plan</h2>
        <SkillTree
          book={book}
          goal={level.goal}
          teaching={teaching}
          onTeach={setTeaching}
          onRemove={(skill, index) => setBook(removeStep(book, skill, index))}
        />
      </section>

      <section aria-labelledby="cards-heading">
        <h2 id="cards-heading">What is “{cardLabel(doSkill(teaching))}” made of?</h2>
        <ul className="card-tray" role="list" aria-label="Cards">
          {level.cards.map((card, index) => (
            <li key={index}>
              <button type="button" className="card-button" onClick={() => setBook(addStep(book, teaching, card))}>
                <SkillCard step={card} />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
