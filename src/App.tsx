import { level1 } from './levels/level1.ts'
import { LevelScreen } from './screens/LevelScreen.tsx'

function App() {
  return (
    <main>
      <h1>Robo needs help</h1>
      <LevelScreen level={level1} />
    </main>
  )
}

export default App
