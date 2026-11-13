# Robo needs help

A small web game that teaches young children (ages 5 to 8) computational thinking by breaking big problems into small steps.

Robo is a friendly robot that only knows a few basic actions: move, pick up, put down and look. When a child gives Robo a big goal such as "cross the river", Robo answers "I don't know how to do that. What is it made of?" The child breaks the goal into smaller steps, and keeps breaking those down until every step is something Robo already knows. Then Robo acts it out, the child sees exactly where it goes wrong, and fixes it.

> Status: early work in progress. The project is set up and tested; the game itself is being built.

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
| `src/screens/` | Screens that hold the game's state and connect components to the core | Yes |

*(These folders are added as each part is built.)*

### Decisions so far

- **The core is pure TypeScript with no React.** The interpreter is a function from a world and an action to a new world or a failure. Running a skill tree produces a list of steps, and the UI only plays that list back. This makes the game logic deterministic and easy to test without rendering anything.
- **The world is a few named places joined by paths, not a grid.** A path can need an item to be in place before it opens (a log on the riverbank opens the way across). One rule covers bridges, keys and similar puzzles, and it keeps the problems everyday ones.
- **Actions never change the world they are given; they return a new one.** Every step of a run can be kept, compared and replayed, and tests need no setup or cleanup between steps.
- **Skills are stored in a skill book, not as a nested tree.** The book maps each skill's name to its steps, and a step is either a basic action or another skill used by name. Reusing "cross the river" in a later level is one reference, not a copy, and fixing a skill fixes it everywhere it is used. The tree the child sees is drawn by expanding names.
- **A skill missing from the book is how Robo asks "what is that made of?"** Running a skill Robo hasn't been taught stops with `unknownSkill`, so the same runner handles both decomposing and debugging. A skill that uses itself is reported as a `loop` instead of running forever.
- **A run returns every action performed, with the world after each one and its place in the tree.** The UI plays this list back at whatever speed it likes and highlights the step that failed; the core knows nothing about animation.
- **New skill names come from idea cards that each level provides.** Children aged 5 to 8 can't type "find a log", so a level offers a few idea cards (icon, label and voice-over), including some that don't help. The child chooses which ideas a goal is made of, then breaks each idea down further. Choosing and rejecting ideas is the decomposition skill itself, and it keeps the game top-down rather than building up from commands.
- **A level is data: a goal, a starting world, a target and the cards on offer.** The target describes what the world must look like at the end (where Robo is, where items are). A run can then end three ways: solved, stuck (a step failed), or not there yet (every step worked but the target wasn't reached). The last one matters for teaching: the plan runs, it just doesn't do what was needed.
- **Failures are codes, not sentences** (`pathBlocked`, `handsFull`, …). The core says what went wrong; the UI decides how to tell a five-year-old, in words, icons and voice.
- **Components take everything through props and know nothing about levels.** `SkillTree` is given a skill book, a goal and which steps to highlight; `SkillCard` is given one step. Either could be dropped into another product.
- **Data flows down, events flow up.** Components never change the skill book themselves. `SkillTree` reports "the child tapped this skill" or "remove step 1 of 'find a log'" through callback props; the screen decides what that means and updates its state. A component given no callbacks draws no buttons, so the same tree works as a read-only view elsewhere.
- **State lives in one place, the screen, and every change to it is a pure core function.** `LevelScreen` holds the child's skill book and which skill is being taught. Adding and removing steps are `addStep` and `removeStep` in the core, which return a new book, so the editing rules are tested without rendering anything.
- **Words and icons live in the UI layer, not the core** (`cardText.ts`). The core says `{ kind: 'move', to: 'forest' }`; the UI says "Go to the forest" with a tree icon. Translation and voice-over will attach there.
- **Each component has its own CSS Module**, so class names are scoped to the component and can't clash with a host product's styles.
- **Accessibility is built into the components:** the step Robo is doing is marked `aria-current="step"`; a failed step has text that screen readers read out, not just a red border; icons are hidden from screen readers because the label already says the same thing; cards are at least 48px tall for small fingers.
- **Children pick steps from cards; they do not type.** The target age is 5 to 8, where many children cannot read or type fluently. Every card has an icon, a text label and voice-over.
- **TypeScript strict mode** is on, so missing cases and possible `null` values are caught at compile time.
- **Tests run in CI on every push** (lint, tests, type-check and build) using GitHub Actions.

## Tech

Vite, React 19, TypeScript, Vitest, React Testing Library, oxlint.
