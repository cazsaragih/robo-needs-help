import { SkillCard } from './components/SkillCard.tsx'
import { SkillTree } from './components/SkillTree.tsx'
import { doAction, doSkill } from './core/skills.ts'
import type { SkillBook } from './core/skills.ts'
import { level1 } from './levels/level1.ts'

// Temporary: a half-taught skill book, to show the tree until children can build their own.
const sampleBook: SkillBook = {
  'cross the river': [doSkill('find a log'), doSkill('carry the log to the river'), doSkill('walk across')],
  'find a log': [doAction({ kind: 'move', to: 'forest' }), doAction({ kind: 'look' })],
}

function App() {
  return (
    <main>
      <h1>Robo needs help</h1>

      <section aria-labelledby="plan-heading">
        <h2 id="plan-heading">Robo's plan</h2>
        <SkillTree book={sampleBook} goal={level1.goal} runningPath={[0, 1]} />
      </section>

      <section aria-labelledby="cards-heading">
        <h2 id="cards-heading">Cards</h2>
        <ul className="card-tray" role="list">
          {level1.cards.map((card, index) => (
            <li key={index}>
              <SkillCard step={card} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
