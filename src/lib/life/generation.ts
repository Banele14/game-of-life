import { ALIVE, DEAD, type Grid, wrap } from "./grid";
import { nextCellState } from "./rules";

// Reads the current grid and writes into a fresh array, so every cell sees
// the same "before" state. Updating in place would let cells later in the
// loop see neighbours that have already changed.
//
// The wrap maths is hoisted out of the inner loop and neighbours are read
// straight from the array. That was ~10x faster than the per-cell helper
// version on large boards (npm run bench). The simple version still lives in
// src/test/reference-life.ts and the property tests compare the two.
export function nextGeneration(grid: Grid): Grid {
  const { width, height, cells } = grid;
  const next = new Uint8Array(cells.length);

  for (let y = 0; y < height; y++) {
    const above = wrap(y - 1, height) * width;
    const row = y * width;
    const below = wrap(y + 1, height) * width;

    for (let x = 0; x < width; x++) {
      const left = x === 0 ? width - 1 : x - 1;
      const right = x === width - 1 ? 0 : x + 1;

      // cells are 0/1, so the sum is the live neighbour count
      const liveNeighbours =
        cells[above + left] +
        cells[above + x] +
        cells[above + right] +
        cells[row + left] +
        cells[row + right] +
        cells[below + left] +
        cells[below + x] +
        cells[below + right];

      next[row + x] = nextCellState(cells[row + x] === ALIVE, liveNeighbours) ? ALIVE : DEAD;
    }
  }

  return { width, height, cells: next };
}

export function advance(grid: Grid, generations: number): Grid {
  let current = grid;
  for (let i = 0; i < generations; i++) current = nextGeneration(current);
  return current;
}
