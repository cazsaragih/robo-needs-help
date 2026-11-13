import { RoboHead } from './components/Robo.tsx'
import { Game } from './screens/Game.tsx'

type AppProps = {
  /** How long each step stays lit while Robo runs the plan. Tests set it to 0. */
  stepDelay?: number
}

function App({ stepDelay }: AppProps) {
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
        <Game stepDelay={stepDelay} />
      </main>
    </>
  )
}

export default App
