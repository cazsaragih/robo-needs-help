import { useId } from 'react'
import type { CSSProperties } from 'react'
import type { MapPoint } from '../core/level.ts'
import type { Action, ItemId, PlaceId, World } from '../core/world.ts'
import { carriedItem } from '../core/world.ts'
import { placeIcon, placeName } from './cardText.ts'
import { RoboHead } from './Robo.tsx'
import styles from './WorldView.module.css'

export type RoboMood = 'idle' | 'busy' | 'happy' | 'confused'

type WorldViewProps = {
  world: World
  /** Where each place sits on the map, seen from above. x and y run from 0 to 100. */
  map: Record<PlaceId, MapPoint>
  /** The place Robo is trying to reach. It gets a flag. */
  goalPlace?: PlaceId
  /** What Robo is doing right now, which picks its animation. */
  action?: Action
  mood?: RoboMood
  /** Changes on every step, so the same animation can play twice in a row. */
  beat?: number
  /** How long one move takes, in milliseconds. */
  moveDuration?: number
}

// The map is drawn in its own units, then scaled to fit the screen.
const WIDTH = 1000
const HEIGHT = 600
const RIVER_WIDTH = 110
const LOG_LENGTH = 120

const colours = {
  grass: '#93cf6c',
  grassDot: '#86c25f',
  meadow: '#b5e38c',
  trail: '#e2c48f',
  trailEdge: '#c9a46a',
  sand: '#efdcaa',
  water: '#4ea7e6',
  waterDeep: '#3d8fd0',
  waterLight: '#c4e6ff',
  leaf: '#3c9b5c',
  leafDark: '#2e7e49',
  leafLight: '#62b878',
  wood: '#8b5a2b',
  woodDark: '#6e4420',
  ink: '#1e2433',
  sun: '#f4a23b',
}

type Point = { x: number; y: number }

/** The world seen from above: places, trails, water, items and Robo. The whole map is always in view. */
export function WorldView({
  world,
  map,
  goalPlace,
  action,
  mood = 'idle',
  beat = 0,
  moveDuration = 700,
}: WorldViewProps) {
  // SVG patterns and filters need ids that are unique on the page, even with several maps.
  const id = useId()
  const grassId = `${id}-grass`
  const shadowId = `${id}-shadow`

  const at = (place: PlaceId): Point => {
    const point = map[place] ?? { x: 50, y: 50 }
    return { x: (point.x / 100) * WIDTH, y: (point.y / 100) * HEIGHT }
  }
  const robo = at(world.roboAt)

  // A path that needs an item is drawn as a river across it; that item lying in place is the bridge.
  const rivers = world.paths.flatMap(({ between: [a, b], needs }) => {
    if (!needs) return []
    const from = at(a)
    const to = at(b)
    const middle = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
    const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI
    return [{ middle, angle, needs }]
  })
  const trails = world.paths.filter((path) => !path.needs)

  function itemPlacement(item: ItemId) {
    const state = world.items[item]
    if (!state || state.at === null) {
      return { x: robo.x + 40, y: robo.y + 42, angle: -20, stretch: 0.8, visible: true }
    }
    const bridge = rivers.find((river) => river.needs.item === item && river.needs.at === state.at)
    if (bridge) {
      const { middle, angle } = bridge
      return { ...middle, angle, stretch: (RIVER_WIDTH + 70) / LOG_LENGTH, visible: true }
    }
    const place = at(state.at)
    return { x: place.x + 55, y: place.y + 45, angle: 0, stretch: 1, visible: !state.hidden }
  }

  return (
    <div className={styles.window} style={{ '--move-ms': `${moveDuration}ms` } as CSSProperties}>
      <svg className={styles.scene} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={describe(world)}>
        <defs>
          <pattern id={grassId} width={36} height={36} patternUnits="userSpaceOnUse">
            <rect width={36} height={36} fill={colours.grass} />
            <path d="M 8 12 l 3 -7 l 3 7 M 26 30 l 3 -7 l 3 7" stroke={colours.grassDot} strokeWidth={2} fill="none" />
          </pattern>
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx={0} dy={5} stdDeviation={0} floodColor="#000000" floodOpacity={0.16} />
          </filter>
        </defs>

        <rect width={WIDTH} height={HEIGHT} fill={`url(#${grassId})`} />

        {rivers.map(({ middle, angle }) => (
          <River key={`${middle.x},${middle.y}`} middle={middle} angle={angle} />
        ))}

        {trails.map(({ between: [a, b] }) => {
          const from = at(a)
          const to = at(b)
          return (
            <g key={`${a}-${b}`} strokeLinecap="round">
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={colours.trailEdge} strokeWidth={34} />
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={colours.trail} strokeWidth={26} />
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={colours.trailEdge}
                strokeWidth={3}
                strokeDasharray="4 18"
                opacity={0.6}
              />
            </g>
          )
        })}

        {Object.keys(map).map((place) => (
          <Ground key={place} id={place} point={at(place)} />
        ))}

        {goalPlace !== undefined && <Flag point={at(goalPlace)} />}

        {Object.keys(world.items).map((item) => {
          const { x, y, angle, stretch, visible } = itemPlacement(item)
          return (
            <g
              key={item}
              className={styles.mover}
              filter={`url(#${shadowId})`}
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${angle}deg) scaleX(${stretch})`,
                opacity: visible ? 1 : 0,
              }}
            >
              <Item id={item} />
            </g>
          )
        })}

        <g className={styles.mover} style={{ transform: `translate(${robo.x}px, ${robo.y}px)` }}>
          <ellipse cy={40} rx={40} ry={10} fill="rgb(0 0 0 / 0.18)" />
          <g key={`${beat}-${mood}`} className={styles.pose} data-action={action?.kind} data-mood={mood}>
            <circle className={styles.ring} r={50} fill="none" stroke="#ffffff" strokeWidth={5} />
            <RoboHead eyesClassName={styles.eyes} />
          </g>
        </g>

        {Object.keys(map).map((place) => (
          <Trees key={place} id={place} point={at(place)} shadow={`url(#${shadowId})`} />
        ))}

        {Object.keys(map).map((place) => (
          <Signpost key={place} id={place} point={at(place)} shadow={`url(#${shadowId})`} />
        ))}
      </svg>
    </div>
  )
}

/** A sentence for screen readers, since they can't see the picture. */
function describe(world: World): string {
  const sentences = [`Robo is at ${placeName(world.roboAt)}.`]
  const carried = carriedItem(world)
  if (carried) sentences.push(`Robo is carrying the ${carried}.`)
  for (const [id, item] of Object.entries(world.items)) {
    if (item.at !== null && !item.hidden) sentences.push(`The ${id} is at ${placeName(item.at)}.`)
  }
  return sentences.join(' ')
}

/** An item seen from above, drawn around its centre. */
function Item({ id }: { id: ItemId }) {
  if (id === 'log') {
    return (
      <>
        <rect x={-LOG_LENGTH / 2} y={-15} width={LOG_LENGTH} height={30} rx={15} fill={colours.wood} />
        <line x1={-42} y1={-5} x2={28} y2={-5} stroke={colours.woodDark} strokeWidth={3} strokeLinecap="round" />
        <line x1={-26} y1={6} x2={42} y2={6} stroke={colours.woodDark} strokeWidth={3} strokeLinecap="round" />
        <ellipse cx={LOG_LENGTH / 2 - 9} cy={0} rx={8} ry={13} fill="#d7a46c" />
        <ellipse cx={LOG_LENGTH / 2 - 9} cy={0} rx={3} ry={6} fill={colours.wood} />
      </>
    )
  }
  return <circle r={16} fill={colours.sun} />
}

/** A river running across the path between two places, at right angles to it. */
function River({ middle, angle }: { middle: Point; angle: number }) {
  const half = RIVER_WIDTH / 2
  return (
    <g transform={`translate(${middle.x} ${middle.y}) rotate(${angle})`}>
      <rect x={-half - 14} y={-1000} width={RIVER_WIDTH + 28} height={2000} fill={colours.sand} />
      <rect x={-half} y={-1000} width={RIVER_WIDTH} height={2000} fill={colours.waterDeep} />
      <rect x={-half + 12} y={-1000} width={RIVER_WIDTH - 24} height={2000} fill={colours.water} />
      {[-22, 18].map((dx, i) => (
        <line
          key={dx}
          x1={dx}
          y1={-1000}
          x2={dx}
          y2={1000}
          stroke={colours.waterLight}
          strokeWidth={4}
          strokeDasharray={i ? '22 48' : '34 40'}
          strokeLinecap="round"
        />
      ))}
    </g>
  )
}

function Flag({ point }: { point: Point }) {
  const x = point.x + 62
  const y = point.y - 18
  return (
    <g>
      <ellipse cx={x} cy={y + 42} rx={12} ry={5} fill="rgb(0 0 0 / 0.18)" />
      <line x1={x} y1={y + 40} x2={x} y2={y - 26} stroke={colours.ink} strokeWidth={5} strokeLinecap="round" />
      <path d={`M ${x} ${y - 26} q 24 -8 48 6 q -14 10 -2 22 q -22 -10 -46 2 z`} fill={colours.sun} />
    </g>
  )
}

/** A label above a place, with the same icon and words as its cards, pointing down at it. */
function Signpost({ id, point, shadow }: { id: PlaceId; point: Point; shadow: string }) {
  // Roughly 14 units per letter at this font size, plus room for the icon and padding.
  const width = placeName(id).length * 14 + 70
  // Keep the sign inside the map, even for a place near the edge.
  const x = Math.min(Math.max(point.x, width / 2 + 8), WIDTH - width / 2 - 8)
  const y = point.y - 92
  return (
    <g filter={shadow}>
      <path d={`M ${point.x - 10} ${y + 20} L ${point.x} ${y + 34} L ${point.x + 10} ${y + 20} Z`} fill="#ffffff" />
      <rect x={x - width / 2} y={y - 24} width={width} height={46} rx={23} fill="#ffffff" />
      <text
        x={x}
        y={y + 8}
        textAnchor="middle"
        fontSize={24}
        fontWeight={700}
        fontFamily="Andika, system-ui, sans-serif"
        fill={colours.ink}
      >
        {placeIcon(id)} {placeName(id)}
      </text>
    </g>
  )
}

/** The ground of a place, drawn under Robo. */
function Ground({ id, point }: { id: PlaceId; point: Point }) {
  const { x, y } = point
  switch (id) {
    case 'meadow':
      return (
        <g>
          <ellipse cx={x} cy={y} rx={125} ry={82} fill={colours.meadow} />
          {[
            [-88, -18, '#ffffff'],
            [-58, 44, '#f7d046'],
            [72, -32, '#f29bc2'],
            [88, 30, '#ffffff'],
            [22, 62, '#f29bc2'],
            [-22, -58, '#f7d046'],
          ].map(([dx, dy, colour], i) => (
            <Flower key={i} x={x + Number(dx)} y={y + Number(dy)} colour={String(colour)} />
          ))}
        </g>
      )
    case 'riverbank':
      return (
        <g>
          <ellipse cx={x} cy={y} rx={92} ry={72} fill={colours.sand} />
          {[
            [-62, -42],
            [-74, 34],
            [-44, 56],
          ].map(([dx, dy], i) => (
            <Cattail key={i} x={x + dx} y={y + dy} />
          ))}
        </g>
      )
    case 'farBank':
      return <ellipse cx={x} cy={y} rx={88} ry={72} fill={colours.meadow} />
    case 'forest':
      return <ellipse cx={x} cy={y} rx={70} ry={58} fill="#7fbf5a" />
    default:
      return <ellipse cx={x} cy={y} rx={70} ry={58} fill={colours.meadow} />
  }
}

/** Trees and bushes, drawn over Robo's layer so they frame each place. */
function Trees({ id, point, shadow }: { id: PlaceId; point: Point; shadow: string }) {
  const { x, y } = point
  let trees: [number, number, number][] = []
  if (id === 'forest') {
    trees = [
      [-88, -12, 42],
      [-50, 58, 36],
      [74, -18, 40],
      [64, 56, 34],
      [-6, 92, 30],
      [-120, 54, 30],
      [10, -72, 30],
    ]
  } else if (id === 'farBank') {
    trees = [
      [-48, 78, 26],
      [48, 72, 22],
    ]
  }
  return (
    <g filter={shadow}>
      {trees.map(([dx, dy, r], i) => (
        <g key={i}>
          <circle cx={x + dx} cy={y + dy} r={r} fill={i % 2 ? colours.leafDark : colours.leaf} />
          <circle cx={x + dx - r * 0.3} cy={y + dy - r * 0.3} r={r * 0.45} fill={colours.leafLight} opacity={0.7} />
        </g>
      ))}
    </g>
  )
}

function Flower({ x, y, colour }: { x: number; y: number; colour: string }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((turn) => (
        <circle
          key={turn}
          cx={x + Math.cos((turn * Math.PI) / 180) * 6}
          cy={y + Math.sin((turn * Math.PI) / 180) * 6}
          r={5}
          fill={colour}
        />
      ))}
      <circle cx={x} cy={y} r={3.5} fill="#e08a1e" />
    </g>
  )
}

function Cattail({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x} y1={y + 16} x2={x} y2={y - 14} stroke="#4f7d35" strokeWidth={4} strokeLinecap="round" />
      <rect x={x - 5} y={y - 22} width={10} height={22} rx={5} fill={colours.woodDark} />
    </g>
  )
}
