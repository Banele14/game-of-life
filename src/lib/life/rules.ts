// Conway's rules (B3/S23): a dead cell with exactly 3 live neighbours is born,
// a live cell with 2 or 3 survives, everything else is dead next generation.
export function nextCellState(isAlive: boolean, liveNeighbours: number): boolean {
  if (isAlive) return liveNeighbours === 2 || liveNeighbours === 3;
  return liveNeighbours === 3;
}
