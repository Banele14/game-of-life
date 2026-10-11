// npm run bench
//
// Plain Node rather than vitest bench: the test runner's module wrapping
// added enough overhead to the hot loop to hide the difference.
import { nextGeneration, randomGrid } from "../src/lib/life";
import { seededRandom } from "../src/test/random";
import { referenceNextGeneration } from "../src/test/reference-life";

const FRAME_BUDGET_MS = 1000 / 60;
const SIZES = [
  [64, 40],
  [256, 256],
  [1024, 1024],
] as const;

function measure(step: () => void, durationMs = 1500): number {
  for (let i = 0; i < 20; i++) step(); // warm up the JIT
  let runs = 0;
  const start = performance.now();
  while (performance.now() - start < durationMs) {
    step();
    runs++;
  }
  return (performance.now() - start) / runs;
}

const rows = SIZES.map(([width, height]) => {
  const grid = randomGrid(width, height, 0.25, seededRandom(1));
  const engine = measure(() => nextGeneration(grid));
  const reference = measure(() => referenceNextGeneration(grid));
  return {
    board: `${width} x ${height}`,
    "engine (ms)": engine.toFixed(3),
    "reference (ms)": reference.toFixed(3),
    "speed-up": `${(reference / engine).toFixed(1)}x`,
    "under 16.7ms?": engine < FRAME_BUDGET_MS ? "yes" : "no",
  };
});

console.log(`\nOne generation, Node ${process.version}\n`);
console.table(rows);
