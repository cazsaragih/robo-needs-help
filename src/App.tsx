import { RoboHead } from './components/Robo.tsx'
import { level1 } from './levels/level1.ts'
import { LevelScreen } from './screens/LevelScreen.tsx'

function App() {
  return (
    <>
      <header className="app-header">
        <span className="logo" aria-hidden="true">
          <svg viewBox="-50 -64 100 100">
            <RoboHead />
          </svg>
        </span>
        <h1 className="wordmark">
          <span className="robo">Robo</span> needs help
        </h1>
      </header>
      <main>
        <LevelScreen level={level1} number={1} />
      </main>
    </>
  )
}

export default App
