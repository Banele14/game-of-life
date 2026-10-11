import type { Grid } from "@/lib/life";

// The slow, obvious version of nextGeneration. Shares no code with the
// engine (own wrapping, own rules) so it can't inherit the engine's bugs.
// The property tests require both to agree on random boards.
export function referenceNextGeneration(grid: Grid): Grid {
  const { width, height } = grid;
  const mod = (n: number, m: number) => ((n % m) + m) % m;
  const alive = (x: number, y: number) => grid.cells[mod(y, height) * width + mod(x, width)] === 1;

  const cells = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let neighbours = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if ((dx !== 0 || dy !== 0) && alive(x + dx, y + dy)) neighbours++;
        }
      }
      const survives = alive(x, y) && (neighbours === 2 || neighbours === 3);
      const isBorn = !alive(x, y) && neighbours === 3;
      cells[y * width + x] = survives || isBorn ? 1 : 0;
    }
  }
  return { width, height, cells };
}
