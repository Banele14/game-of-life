# Design notes

The main decisions, and what they cost.

## Engine separate from the UI

Everything in `src/lib` is plain TypeScript. It's quick to test (no rendering) and could move into a Web Worker or another framework unchanged. An ESLint `no-restricted-imports` rule enforces this, and the `logic` test project runs in Node with no DOM at all. The cost is a bit of wiring in `GameOfLife.tsx`.

## Flat `Uint8Array` grid

One byte per cell, contiguous, indexed with `y * width + x`. Live cells are 1, so counting neighbours is just addition. Grids are treated as immutable: React can spot changes with a reference check, and keeping history for an undo feature would be cheap.

Downsides: the cost scales with the board's area, not the number of live cells, so a huge sparse board would waste work. And `readonly` doesn't stop writes into a typed array, so immutability is a convention, backed by a property test that fails if the engine modifies its input.

Also considered: `boolean[][]` (more memory, slower to scan), a `Set` of live cells (better for an infinite or sparse board), and bit-packing (not worth it at 64 x 40).

## Wrapping edges

The board is a torus. Every cell has eight neighbours, so there are no special cases, and spaceships loop round instead of dying at the edge. It isn't the true infinite game, though: the glider gun's gliders eventually wrap round and destroy it. Boards smaller than 3 x 3 are rejected because a cell would count itself as a neighbour.

## Canvas instead of DOM cells

2,560 cells redrawn up to 60 times a second is a lot of DOM for React to reconcile. One canvas costs the same however many cells are alive, and React only renders the controls. The backing store follows `devicePixelRatio` so it stays sharp on retina screens. Pointer events are sampled, so fast drags are filled in with Bresenham's line algorithm.

The cost is that a canvas is a single image to a screen reader. Everything except drawing individual cells has a labelled button or a shortcut; drawing with the keyboard is still missing.

## `useReducer`, no state library

There are six fields of state. One pure reducer gets most of what Redux offers without the dependency, and it's tested without React. Random boards are generated outside the reducer so it stays deterministic. If the state grew (undo, saved boards) I'd look at Zustand.

## Next.js static export

There's no server logic, so it uses `output: "export"` and deploys to GitHub Pages. Vite and React would have been a perfectly good choice too. Next.js is what I use day to day, and because the engine doesn't depend on it, switching would only mean replacing a thin shell.

The first board is a fixed pattern rather than a random one. The page is pre-rendered at build time, and a random start would cause a hydration mismatch.

## Testing

- Rules: exhaustive (18 cases).
- Engine: known patterns, plus fast-check properties. On random boards it must agree with `src/test/reference-life.ts`, which shares no code with the engine, and it must give the same result if the board is shifted, mirrored or rotated first.
- Reducer and hooks: Vitest, with fake timers for the animation loop.
- Components: Testing Library.
- The built site: Playwright at two screen sizes, plus axe.

Mutation check: removing a neighbour, disabling wrapping or updating in place each fails the suite. The first time this was tried, the translation property still passed with wrapping broken. Its helper used the engine's own `isAlive()`, and the random shifts were so large that most boards came out empty either way. It now has its own wrap maths and smaller shifts.

## Performance

The first version called a helper for each neighbour. Benchmarked inside Vitest, it looked like ~34 ms per generation at 256 x 256, and the rewritten loop looked barely faster. Running the same comparison in plain Node showed the test runner's module wrapping was skewing the numbers: the rewrite is about 10x faster. `npm run bench` now runs outside the test runner, and a property test checks the fast version against the naive one.
