type RoboHeadProps = {
  /** A class for Robo's eyes, so a scene can animate them. */
  eyesClassName?: string
}

/**
 * Robo's head, Robo's icon everywhere in the game. Drawn as SVG shapes centred on (0, 0),
 * about 90 units wide and 110 tall including the antenna. Use inside an <svg>.
 */
export function RoboHead({ eyesClassName }: RoboHeadProps) {
  return (
    <>
      <line x1={0} y1={-34} x2={0} y2={-50} stroke="#1f2430" strokeWidth={4} />
      <circle cx={0} cy={-54} r={7} fill="#f2a33a" />
      <rect x={-42} y={-34} width={84} height={66} rx={22} fill="#4fc1ba" stroke="#2b8c86" strokeWidth={4} />
      <g className={eyesClassName}>
        <circle cx={-17} cy={-5} r={13} fill="#ffffff" />
        <circle cx={17} cy={-5} r={13} fill="#ffffff" />
        <circle cx={-17} cy={-5} r={6} fill="#1f2430" />
        <circle cx={17} cy={-5} r={6} fill="#1f2430" />
      </g>
      <path d="M -12 15 Q 0 23 12 15" stroke="#1f2430" strokeWidth={4} fill="none" strokeLinecap="round" />
    </>
  )
}
