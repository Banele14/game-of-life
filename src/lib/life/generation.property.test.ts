import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { referenceNextGeneration } from "@/test/reference-life";
import { nextGeneration } from "./generation";
import { type Grid, gridToRows } from "./grid";

// The rules don't care where a pattern is or which way up it is, so
// shift/mirror/rotate then step must equal step then shift/mirror/rotate.
// Translation catches edge-wrapping bugs; mirror/rotate catch a wrong or
// missing neighbour offset. The reference check catches everything else.

const cellsArb = (count: number) =>
  fc.uint8Array({ minLength: count, maxLength: count, min: 0, max: 1 });

const gridArb: fc.Arbitrary<Grid> = fc
  .record({ width: fc.integer({ min: 3, max: 12 }), height: fc.integer({ min: 3, max: 12 }) })
  .chain(({ width, height }) =>
    cellsArb(width * height).map((cells) => ({ width, height, cells })),
  );

// Keep shifts small. Huge ones mostly just loop the board and prove nothing.
const offsetArb = fc.integer({ min: -15, max: 15 });

const squareGridArb: fc.Arbitrary<Grid> = fc
  .integer({ min: 3, max: 12 })
  .chain((size) => cellsArb(size * size).map((cells) => ({ width: size, height: size, cells })));

// Own wrap maths on purpose. This used to call the engine's isAlive(), and
// the translation test kept passing with wrapping broken.
function remap(grid: Grid, source: (x: number, y: number) => [number, number]): Grid {
  const { width, height } = grid;
  const mod = (n: number, m: number) => ((n % m) + m) % m;
  const cells = new Uint8Array(grid.cells.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [sx, sy] = source(x, y);
      cells[y * width + x] = grid.cells[mod(sy, height) * width + mod(sx, width)];
    }
  }
  return { width, height, cells };
}

const shift = (grid: Grid, dx: number, dy: number) => remap(grid, (x, y) => [x - dx, y - dy]);
const mirror = (grid: Grid) => remap(grid, (x, y) => [grid.width - 1 - x, y]);
const rotate = (grid: Grid) => remap(grid, (x, y) => [y, grid.width - 1 - x]);

const rows = gridToRows;

describe("nextGeneration properties", () => {
  it("agrees with the simple reference implementation on every board", () => {
    fc.assert(
      fc.property(gridArb, (grid) => {
        expect(rows(nextGeneration(grid))).toEqual(rows(referenceNextGeneration(grid)));
      }),
      { numRuns: 500 },
    );
  });

  it("never modifies its input", () => {
    fc.assert(
      fc.property(gridArb, (grid) => {
        const before = grid.cells.slice();
        nextGeneration(grid);
        expect(grid.cells).toEqual(before);
      }),
    );
  });

  it("is deterministic: the same board always produces the same next board", () => {
    fc.assert(
      fc.property(gridArb, (grid) => {
        expect(rows(nextGeneration(grid))).toEqual(rows(nextGeneration(grid)));
      }),
    );
  });

  it("is unaffected by where a pattern sits on the wrapping board (translation)", () => {
    fc.assert(
      fc.property(gridArb, offsetArb, offsetArb, (grid, dx, dy) => {
        expect(rows(nextGeneration(shift(grid, dx, dy)))).toEqual(
          rows(shift(nextGeneration(grid), dx, dy)),
        );
      }),
    );
  });

  it("is unaffected by mirroring the board", () => {
    fc.assert(
      fc.property(gridArb, (grid) => {
        expect(rows(nextGeneration(mirror(grid)))).toEqual(rows(mirror(nextGeneration(grid))));
      }),
    );
  });

  it("is unaffected by rotating a square board", () => {
    fc.assert(
      fc.property(squareGridArb, (grid) => {
        expect(rows(nextGeneration(rotate(grid)))).toEqual(rows(rotate(nextGeneration(grid))));
      }),
    );
  });
});
