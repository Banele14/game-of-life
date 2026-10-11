// A board is a flat Uint8Array in row-major order: cell (x, y) lives at
// y * width + x, 1 = alive, 0 = dead. Grids are never mutated after they're
// created; every helper that "changes" one returns a new grid.
// Edges wrap (the board is a torus).

export interface Grid {
  readonly width: number;
  readonly height: number;
  readonly cells: Uint8Array;
}

export interface Cell {
  readonly x: number;
  readonly y: number;
}

export const ALIVE = 1;
export const DEAD = 0;

// Below 3x3 a wrapped cell would count itself (or one neighbour twice).
export const MIN_GRID_SIZE = 3;

export function createGrid(width: number, height: number): Grid {
  assertValidSize(width, "width");
  assertValidSize(height, "height");
  return { width, height, cells: new Uint8Array(width * height) };
}

// -1 -> size - 1, size -> 0
export function wrap(value: number, size: number): number {
  return ((value % size) + size) % size;
}

export function indexOf(grid: Grid, x: number, y: number): number {
  return wrap(y, grid.height) * grid.width + wrap(x, grid.width);
}

export function isAlive(grid: Grid, x: number, y: number): boolean {
  return grid.cells[indexOf(grid, x, y)] === ALIVE;
}

export function setCell(grid: Grid, x: number, y: number, alive: boolean): Grid {
  return setCells(grid, [{ x, y }], alive);
}

// Copies at most once. Returns the same grid if nothing changed, so callers
// can bail out with a cheap === check.
export function setCells(grid: Grid, cells: readonly Cell[], alive: boolean): Grid {
  const value = alive ? ALIVE : DEAD;
  let next: Uint8Array | null = null;

  for (const { x, y } of cells) {
    const index = indexOf(grid, x, y);
    if ((next ?? grid.cells)[index] === value) continue;
    next ??= grid.cells.slice();
    next[index] = value;
  }

  return next ? { ...grid, cells: next } : grid;
}

export function toggleCell(grid: Grid, x: number, y: number): Grid {
  return setCell(grid, x, y, !isAlive(grid, x, y));
}

export function population(grid: Grid): number {
  let count = 0;
  for (const cell of grid.cells) count += cell;
  return count;
}

export function gridsEqual(a: Grid, b: Grid): boolean {
  if (a.width !== b.width || a.height !== b.height) return false;
  return a.cells.every((cell, index) => cell === b.cells[index]);
}

// `random` is injectable so tests can use a seeded generator.
export function randomGrid(
  width: number,
  height: number,
  density: number,
  random: () => number = Math.random,
): Grid {
  if (!(density >= 0 && density <= 1)) {
    throw new RangeError(`density must be between 0 and 1, got ${density}`);
  }
  const grid = createGrid(width, height);
  for (let i = 0; i < grid.cells.length; i++) {
    grid.cells[i] = random() < density ? ALIVE : DEAD;
  }
  return grid;
}

// Plaintext pattern format: "O" = alive, "." = dead, one string per row.
// Short rows are padded with dead cells.
export function gridFromRows(rows: readonly string[]): Grid {
  const width = Math.max(0, ...rows.map((row) => row.length));
  const grid = createGrid(width, rows.length);

  rows.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (char === "O") grid.cells[y * width + x] = ALIVE;
      else if (char !== ".") {
        throw new SyntaxError(`Unexpected "${char}" at row ${y}, column ${x}`);
      }
    });
  });

  return grid;
}

export function gridToRows(grid: Grid): string[] {
  const rows: string[] = [];
  for (let y = 0; y < grid.height; y++) {
    let row = "";
    for (let x = 0; x < grid.width; x++) row += isAlive(grid, x, y) ? "O" : ".";
    rows.push(row);
  }
  return rows;
}

// Stamps the live cells of `pattern` with its top-left corner at (offsetX, offsetY).
export function placePattern(grid: Grid, pattern: Grid, offsetX: number, offsetY: number): Grid {
  const live: Cell[] = [];
  for (let y = 0; y < pattern.height; y++) {
    for (let x = 0; x < pattern.width; x++) {
      if (isAlive(pattern, x, y)) live.push({ x: offsetX + x, y: offsetY + y });
    }
  }
  return setCells(grid, live, true);
}

export function centredPattern(pattern: Grid, width: number, height: number): Grid {
  if (pattern.width > width || pattern.height > height) {
    throw new RangeError(
      `A ${pattern.width}x${pattern.height} pattern does not fit a ${width}x${height} grid`,
    );
  }
  const offsetX = Math.floor((width - pattern.width) / 2);
  const offsetY = Math.floor((height - pattern.height) / 2);
  return placePattern(createGrid(width, height), pattern, offsetX, offsetY);
}

function assertValidSize(size: number, name: string): void {
  if (!Number.isInteger(size) || size < MIN_GRID_SIZE) {
    throw new RangeError(`${name} must be an integer of at least ${MIN_GRID_SIZE}, got ${size}`);
  }
}
