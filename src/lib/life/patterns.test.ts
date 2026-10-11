import { describe, expect, it } from "vitest";
import { advance } from "./generation";
import { createGrid, gridFromRows, gridToRows, placePattern, population } from "./grid";
import { findPattern, loadPattern, PATTERNS } from "./patterns";

const BOARD = { width: 64, height: 40 };

describe("PATTERNS", () => {
  it("have unique ids", () => {
    const ids = PATTERNS.map((pattern) => pattern.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(PATTERNS)("$name fits the default board", (pattern) => {
    const grid = loadPattern(pattern, BOARD.width, BOARD.height);
    expect(population(grid)).toBe(population(gridFromRows(pattern.rows)));
    expect(population(grid)).toBeGreaterThan(0);
  });

  it("can be looked up by id", () => {
    expect(findPattern("glider")?.name).toBe("Glider");
    expect(findPattern("does-not-exist")).toBeUndefined();
  });
});

// Each note in patterns.ts makes a claim; these hold it to that claim.
describe("pattern behaviour", () => {
  const place = (id: string, x: number, y: number) =>
    placePattern(createGrid(BOARD.width, BOARD.height), gridFromRows(findPattern(id)!.rows), x, y);

  it("glider moves one cell diagonally every 4 generations", () => {
    expect(gridToRows(advance(place("glider", 10, 10), 4))).toEqual(
      gridToRows(place("glider", 11, 11)),
    );
  });

  it("lightweight spaceship moves two cells sideways every 4 generations", () => {
    expect(gridToRows(advance(place("lwss", 30, 18), 4))).toEqual(
      gridToRows(place("lwss", 28, 18)),
    );
  });

  it("pulsar repeats every 3 generations", () => {
    const start = place("pulsar", 25, 13);
    expect(gridToRows(advance(start, 1))).not.toEqual(gridToRows(start));
    expect(gridToRows(advance(start, 3))).toEqual(gridToRows(start));
  });

  it("glider gun adds one glider (5 cells) every 30 generations", () => {
    const start = place("gosper-glider-gun", 2, 2);
    expect(population(start)).toBe(36);
    expect(population(advance(start, 30))).toBe(41);
    expect(population(advance(start, 60))).toBe(46);
  });

  it("R-pentomino is five cells", () => {
    expect(population(place("r-pentomino", 30, 18))).toBe(5);
  });
});
