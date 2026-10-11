import { describe, expect, it } from "vitest";
import { seededRandom } from "@/test/random";
import {
  centredPattern,
  createGrid,
  gridFromRows,
  gridsEqual,
  gridToRows,
  indexOf,
  isAlive,
  placePattern,
  population,
  randomGrid,
  setCell,
  setCells,
  toggleCell,
  wrap,
} from "./grid";

describe("createGrid", () => {
  it("creates an empty grid of the requested size", () => {
    const grid = createGrid(5, 4);
    expect(grid.width).toBe(5);
    expect(grid.height).toBe(4);
    expect(grid.cells).toHaveLength(20);
    expect(population(grid)).toBe(0);
  });

  it.each([0, 2, -5, 3.5, Number.NaN])("rejects a size of %s", (size) => {
    expect(() => createGrid(size, 10)).toThrow(RangeError);
    expect(() => createGrid(10, size)).toThrow(RangeError);
  });
});

describe("wrap", () => {
  it.each([
    { value: 0, size: 5, expected: 0 },
    { value: 4, size: 5, expected: 4 },
    { value: 5, size: 5, expected: 0 },
    { value: -1, size: 5, expected: 4 },
    { value: -6, size: 5, expected: 4 },
    { value: 12, size: 5, expected: 2 },
  ])("wraps $value onto a size of $size as $expected", ({ value, size, expected }) => {
    expect(wrap(value, size)).toBe(expected);
  });
});

describe("indexOf", () => {
  it("stores cells row by row", () => {
    const grid = createGrid(5, 4);
    expect(indexOf(grid, 0, 0)).toBe(0);
    expect(indexOf(grid, 4, 0)).toBe(4);
    expect(indexOf(grid, 0, 1)).toBe(5);
    expect(indexOf(grid, 4, 3)).toBe(19);
  });

  it("wraps coordinates that fall off the board", () => {
    const grid = createGrid(5, 4);
    expect(indexOf(grid, -1, 0)).toBe(indexOf(grid, 4, 0));
    expect(indexOf(grid, 0, -1)).toBe(indexOf(grid, 0, 3));
    expect(indexOf(grid, 5, 4)).toBe(indexOf(grid, 0, 0));
  });
});

describe("setCell / setCells / toggleCell", () => {
  it("returns a new grid and leaves the original untouched", () => {
    const original = createGrid(4, 4);
    const updated = setCell(original, 1, 2, true);

    expect(isAlive(updated, 1, 2)).toBe(true);
    expect(isAlive(original, 1, 2)).toBe(false);
    expect(updated).not.toBe(original);
  });

  it("returns the very same grid when nothing changes", () => {
    const grid = setCell(createGrid(4, 4), 1, 1, true);
    expect(setCell(grid, 1, 1, true)).toBe(grid);
    expect(setCells(grid, [], true)).toBe(grid);
  });

  it("sets many cells in one go", () => {
    const grid = setCells(
      createGrid(4, 4),
      [
        { x: 0, y: 0 },
        { x: 3, y: 3 },
        { x: 3, y: 3 },
      ],
      true,
    );
    expect(population(grid)).toBe(2);
  });

  it("can kill cells as well as create them", () => {
    const grid = gridFromRows(["OOO", "OOO", "OOO"]);
    const updated = setCells(grid, [{ x: 1, y: 1 }], false);
    expect(gridToRows(updated)).toEqual(["OOO", "O.O", "OOO"]);
  });

  it("toggles a cell on and off", () => {
    const grid = createGrid(3, 3);
    const on = toggleCell(grid, 2, 0);
    const off = toggleCell(on, 2, 0);
    expect(isAlive(on, 2, 0)).toBe(true);
    expect(isAlive(off, 2, 0)).toBe(false);
  });
});

describe("gridFromRows / gridToRows", () => {
  it("parses the plaintext format", () => {
    const grid = gridFromRows([".O.", "..O", "OOO"]);
    expect(grid.width).toBe(3);
    expect(grid.height).toBe(3);
    expect(population(grid)).toBe(5);
    expect(isAlive(grid, 1, 0)).toBe(true);
    expect(isAlive(grid, 0, 0)).toBe(false);
  });

  it("round-trips back to the same text", () => {
    const rows = ["O..O.", ".....", "OOOO.", "....O"];
    expect(gridToRows(gridFromRows(rows))).toEqual(rows);
  });

  it("pads short rows with dead cells", () => {
    expect(gridToRows(gridFromRows(["O", "...", "O."]))).toEqual(["O..", "...", "O.."]);
  });

  it("rejects unknown characters with a helpful message", () => {
    expect(() => gridFromRows(["...", ".X.", "..."])).toThrow('Unexpected "X" at row 1, column 1');
  });
});

describe("population and gridsEqual", () => {
  it("counts live cells", () => {
    expect(population(gridFromRows(["O.O", ".O.", "..."]))).toBe(3);
  });

  it("compares size and contents", () => {
    const a = gridFromRows(["O..", "...", "..."]);
    expect(gridsEqual(a, gridFromRows(["O..", "...", "..."]))).toBe(true);
    expect(gridsEqual(a, gridFromRows([".O.", "...", "..."]))).toBe(false);
    expect(gridsEqual(a, gridFromRows(["O...", "....", "...."]))).toBe(false);
  });
});

describe("randomGrid", () => {
  it("is repeatable when given the same random source", () => {
    const first = randomGrid(20, 20, 0.3, seededRandom(42));
    const second = randomGrid(20, 20, 0.3, seededRandom(42));
    expect(gridsEqual(first, second)).toBe(true);
  });

  it("produces roughly the requested density", () => {
    const grid = randomGrid(100, 100, 0.25, seededRandom(7));
    expect(population(grid) / 10_000).toBeCloseTo(0.25, 1);
  });

  it("respects the extremes of density", () => {
    expect(population(randomGrid(10, 10, 0))).toBe(0);
    expect(population(randomGrid(10, 10, 1))).toBe(100);
  });

  it.each([-0.1, 1.5, Number.NaN])("rejects a density of %s", (density) => {
    expect(() => randomGrid(10, 10, density)).toThrow(RangeError);
  });
});

describe("placePattern / centredPattern", () => {
  const glider = gridFromRows([".O.", "..O", "OOO"]);

  it("centres a pattern on a larger board", () => {
    expect(gridToRows(centredPattern(glider, 5, 5))).toEqual([
      ".....",
      "..O..",
      "...O.",
      ".OOO.",
      ".....",
    ]);
  });

  it("wraps a pattern placed across an edge", () => {
    const grid = placePattern(createGrid(4, 4), glider, 2, 2);
    expect(gridToRows(grid)).toEqual(["O.OO", "....", "...O", "O..."]);
  });

  it("refuses a pattern that does not fit", () => {
    expect(() => centredPattern(glider, 3, 2)).toThrow(RangeError);
  });
});
