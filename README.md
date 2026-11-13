# Robo needs help

A small web game that teaches young children (ages 5 to 8) computational thinking by breaking big problems into small steps.

Robo is a friendly robot that only knows a few basic actions: move, pick up, put down and look. When a child gives Robo a big goal such as "cross the river", Robo answers "I don't know how to do that. What is it made of?" The child breaks the goal into smaller steps, and keeps breaking those down until every step is something Robo already knows. Then Robo acts it out, the child sees exactly where it goes wrong, and fixes it.

> Status: three playable levels. Still to come: voice-over for children who can't read yet, and a public link to play it.

## The three levels

| Level | Goal | What it adds |
|---|---|---|
| 1 | Post the letter | Decomposition, gently: break the goal into two ideas ("find the letter", "carry the letter to the postbox"), and the ideas into actions. Introduces the pattern *find something, then carry it somewhere*. |
| 2 | Cross the river | The same pattern ("find a log", "carry the log to the river") with a twist: where the log is put down matters, because there it becomes a bridge. Three ideas, and a dead end ("build a boat"). |
| 3 | Plant a garden | The garden is across the same river. "Cross the river", taught in level 2, is now **one card**: Robo already knows it, so 7 of the 13 actions come for free. |

The progression is *learn a pattern → apply it with a twist → reuse a whole skill*: difficulty rises from level 1 to 2, and level 3 is bigger again but feels lighter because of what the child already taught. Levels unlock in order, so a child always reaches level 3 knowing how to cross the river. (The first version had the river first and the letter second, which made level 2 easier than level 1; swapping them fixed the dip.)

## What it teaches

- **Decomposition:** break a big problem down until you reach things you know for sure.
- **Abstraction:** a skill Robo has been taught is remembered and can be used as a single step later.
- **Pattern recognition:** later levels get easier when earlier skills are reused.
- **Algorithms and debugging:** order the steps, run them, find the step that fails and fix it.

Most coding games for children work bottom-up: you start with commands and assemble them toward a goal. This one works top-down: you start with the goal and decompose it. The program a child builds is a tree of skills, not a list of commands.

## Running it

```bash
npm install
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm test` | Run all tests once |
| `npm run test:watch` | Re-run tests as files change |
| `npm run lint` | Check the code with oxlint |
| `npm run build` | Type-check and build for production |

## Architecture

The code is split into three layers. Each layer only depends on the ones above it in this list.

| Folder | Contents | Depends on React |
|---|---|---|
| `src/core/` | Skill tree, world model, and the interpreter that runs a skill tree against a world | No |
| `src/levels/` | Levels described as plain data | No |
| `src/components/` | Reusable UI parts: skill card, skill tree, world view, Robo | Yes |
| `src/screens/` | `Game` (which level is open, which are solved, the shared skill book) and `LevelScreen` (one level: building, running and watching the plan) | Yes |

### Decisions so far

- **The core is pure TypeScript with no React.** The interpreter is a function from a world and an action to a new world or a failure. Running a skill tree produces a list of steps, and the UI only plays that list back. This makes the game logic deterministic and easy to test without rendering anything.
- **The world is a few named places joined by paths, not a grid.** A path can need an item to be in place before it opens (a log on the riverbank opens the way across). One rule covers bridges, keys and similar puzzles, and it keeps the problems everyday ones.
- **Actions never change the world they are given; they return a new one.** Every step of a run can be kept, compared and replayed, and tests need no setup or cleanup between steps.
- **Skills are stored in a skill book, not as a nested tree.** The book maps each skill's name to its steps, and a step is either a basic action or another skill used by name. Reusing "cross the river" in a later level is one reference, not a copy, and fixing a skill fixes it everywhere it is used. The tree the child sees is drawn by expanding names.
- **A skill missing from the book is how Robo asks "what is that made of?"** Running a skill Robo hasn't been taught stops with `unknownSkill`, so the same runner handles both decomposing and debugging. A skill that uses itself is reported as a `loop` instead of running forever.
- **A run returns every action performed, with the world after each one and its place in the tree.** The UI plays this list back at whatever speed it likes and highlights the step that failed; the core knows nothing about animation.
- **New skill names come from idea cards that each level provides.** Children aged 5 to 8 can't type "find a log", so a level offers a few idea cards (icon, label and voice-over), including some that don't help. The child chooses which ideas a goal is made of, then breaks each idea down further. Choosing and rejecting ideas is the decomposition skill itself, and it keeps the game top-down rather than building up from commands.
- **Every idea card has a check: what must be true once it's done.** "Find a log" is done when Robo can see a log; "walk across" when Robo is on the other side. When Robo finishes an idea, it checks it, and if the check fails it stops right there and says what's missing ("I did "find a log", but I can't see the log."). Without this, idea names meant nothing: a child could put the whole solution inside "build a boat" and win, skipping decomposition. With it, each idea is a real sub-goal, much like a unit test for a skill, and mistakes are caught in the idea where they happen. The runner only takes a "was this skill done?" callback, so the core still knows nothing about levels.
- **One skill book for the whole game.** `Game` holds it and every level reads and changes the same book, so a skill taught in one level is still known in the next. That is the abstraction lesson: in level 3, "cross the river" is a single card because the child taught it in level 2, and the level 3 river is the same as level 2's so the old skill works unchanged.
- **Level files are named after what they are** (`postTheLetter.ts`, `crossTheRiver.ts`, `plantAGarden.ts`), and their order lives in one list in `levels/index.ts`. Reordering levels is a one-line change, and "level 1" never means two different things in the code.
- **Skills learned in earlier levels are drawn folded:** one card with "✓ Robo already knows this", which lights up as a whole while Robo works through it on the map. The child sees their earlier work pay off without a wall of old steps, and can't accidentally edit a finished skill from inside another level.
- **A new React `key` per level** restarts the level screen when the child moves on, so no run, highlight or chosen skill leaks from one level to the next, while the shared skill book (held above it) stays.
- **A level is data: a goal, a starting world, a target and the cards on offer.** The target describes what the world must look like at the end (where Robo is, where items are). A run can then end three ways: solved, stuck (a step failed), or not there yet (every step worked but the target wasn't reached). The last one matters for teaching: the plan runs, it just doesn't do what was needed.
- **Failures are codes, not sentences** (`pathBlocked`, `handsFull`, …). The core says what went wrong; the UI decides how to tell a five-year-old, in words, icons and voice.
- **Components take everything through props and know nothing about levels.** `SkillTree` is given a skill book, a goal and which steps to highlight; `SkillCard` is given one step. Either could be dropped into another product.
- **Data flows down, events flow up.** Components never change the skill book themselves. `SkillTree` reports "the child tapped this skill" or "remove step 1 of 'find a log'" through callback props; the screen decides what that means and updates its state. A component given no callbacks draws no buttons, so the same tree works as a read-only view elsewhere.
- **State lives in one place, the screen, and every change to it is a pure core function.** `LevelScreen` holds the child's skill book and which skill is being taught. Adding and removing steps are `addStep` and `removeStep` in the core, which return a new book, so the editing rules are tested without rendering anything.
- **Running a plan is computed once, then played back.** Pressing Run calls `playLevel`, which returns every step instantly. The screen then lights up one step at a time with a timer, and only at the end shows the failed card and what Robo says. The step delay is a prop, so tests run with no delay. The plan is locked while Robo runs, and any edit clears the last run's highlights so they never point at the wrong card.
- **Robo's speech is announced to screen readers.** The speech bubble is a `role="status"` region that is always on the page, so each new sentence is read out without moving focus. Each kind of failure has its own sentence, worded for a young child ("My hands are full!"), and the sentences live in the UI layer next to the card labels.
- **The world view is a top-down map drawn in SVG and animated with CSS, not a game engine.** The whole map is always in view, so children can see which places connect before they plan. React re-renders the map from the world after each step; CSS transitions glide Robo and items from where they were to where they are now, and short CSS animations show each action (a hop for walking, darting eyes and a ripple for looking, a squash for picking up). All motion switches off when the device asks for reduced motion.
- **Robo's head is Robo's icon everywhere:** as the token on the map and next to its speech bubble. One `RoboHead` component draws it.
- **Levels give each place an x and y position on the map (0–100), and nothing more about drawing.** Trails are drawn between connected places. A path that needs an item is drawn as a river across it, and that item lying in place is drawn as a bridge, so the river comes from the level's rules rather than being painted in by hand. Each place has a signpost with the same icon as its cards, so children who can't read can match cards to places.
- **The scene has a text description for screen readers** ("Robo is at the forest. Robo is carrying the log."), since the picture alone says nothing to them.
- **Visual design follows research on young children's interfaces:** big, chunky targets that press down when tapped, so every tap gets visible feedback ([Nielsen Norman Group](https://www.nngroup.com/articles/children-ux-physical-development/)); "Go!" instead of "Run", since words like "submit" confuse 6–8-year-olds; and fewer choices at a glance, with the card tray split into *Ideas* and *Robo knows how to*.
- **Two bundled fonts.** [Andika](https://software.sil.org/andika/), designed by SIL for beginning readers (single-storey *a* and *g*, as in early-reading books), for everything children read. Fredoka, a rounded display font, only for the title and headings. Both are bundled with the app through Fontsource rather than loaded from Google Fonts, so a child's device never contacts a third-party server, in the spirit of [ScratchJr](https://www.media.mit.edu/publications/designing-scratchjr-support-for-early-childhood-learning-through-computer-programming/)'s rule of no internet links in the app.
- **One set of design tokens** (colours, radius and fonts as CSS custom properties in `index.css`) that every component's CSS Module uses, so the look can be changed in one place.
- **Words and icons live in the UI layer, not the core** (`cardText.ts`). The core says `{ kind: 'move', to: 'forest' }`; the UI says "Go to the forest" with a tree icon. Translation and voice-over will attach there.
- **Each component has its own CSS Module**, so class names are scoped to the component and can't clash with a host product's styles.
- **Accessibility is built into the components:** the step Robo is doing is marked `aria-current="step"`; a failed step has text that screen readers read out, not just a red border; icons are hidden from screen readers because the label already says the same thing; cards are at least 48px tall for small fingers.
- **Children pick steps from cards; they do not type.** The target age is 5 to 8, where many children cannot read or type fluently. Every card has an icon, a text label and voice-over.
- **TypeScript strict mode** is on, so missing cases and possible `null` values are caught at compile time.
- **Tests run in CI on every push** (lint, tests, type-check and build) using GitHub Actions.

## Tech

Vite, React 19, TypeScript, Vitest, React Testing Library, oxlint, Fontsource (Andika and Fredoka).
