import { describe, expect, it } from "vitest";
import { advance, nextGeneration } from "./generation";
import { createGrid, gridFromRows, gridToRows, placePattern, population } from "./grid";

const after = (rows: string[], generations = 1) =>
  gridToRows(advance(gridFromRows(rows), generations));

describe("nextGeneration: the wrapping edges", () => {
  it("treats the four corners as neighbours of each other", () => {
    // with wrapping, the empty corner has the other three as neighbours
    expect(after(["....O", ".....", ".....", ".....", "O...O"])).toEqual([
      "O...O",
      ".....",
      ".....",
      ".....",
      "O...O",
    ]);
  });

  it("keeps that corner block stable, like any other block", () => {
    const corners = ["O...O", ".....", ".....", ".....", "O...O"];
    expect(after(corners, 5)).toEqual(corners);
  });
});

describe("nextGeneration: basic behaviour", () => {
  it("leaves an empty board empty", () => {
    expect(population(nextGeneration(createGrid(8, 8)))).toBe(0);
  });

  it("kills a lone cell (underpopulation)", () => {
    expect(after([".....", ".....", "..O..", ".....", "....."])).toEqual([
      ".....",
      ".....",
      ".....",
      ".....",
      ".....",
    ]);
  });

  it("kills a crowded centre (overpopulation) while the edges are born or survive", () => {
    expect(after([".....", ".OOO.", ".OOO.", ".OOO.", "....."])).toEqual([
      "..O..",
      ".O.O.",
      "O...O",
      ".O.O.",
      "..O..",
    ]);
  });

  it("does not modify the grid it is given", () => {
    const grid = gridFromRows([".....", ".....", ".OOO.", ".....", "....."]);
    const before = gridToRows(grid);
    nextGeneration(grid);
    expect(gridToRows(grid)).toEqual(before);
  });

  it("updates every cell simultaneously", () => {
    // an in-place update corrupts this half way through the row
    expect(after([".....", ".....", ".OOO.", ".....", "....."])).toEqual([
      ".....",
      "..O..",
      "..O..",
      "..O..",
      ".....",
    ]);
  });
});

describe("nextGeneration: still lifes never change", () => {
  it.each([
    { name: "block", rows: ["....", ".OO.", ".OO.", "...."] },
    { name: "beehive", rows: ["......", "..OO..", ".O..O.", "..OO..", "......"] },
    { name: "loaf", rows: ["......", "..OO..", ".O..O.", "..O.O.", "...O..", "......"] },
    { name: "boat", rows: [".....", ".OO..", ".O.O.", "..O..", "....."] },
  ])("$name", ({ rows }) => {
    expect(after(rows)).toEqual(rows);
  });
});

describe("nextGeneration: oscillators repeat on a fixed period", () => {
  it.each([
    { name: "blinker", period: 2, rows: [".....", ".....", ".OOO.", ".....", "....."] },
    { name: "toad", period: 2, rows: ["......", "......", "..OOO.", ".OOO..", "......", "......"] },
    {
      name: "beacon",
      period: 2,
      rows: ["......", ".OO...", ".OO...", "...OO.", "...OO.", "......"],
    },
  ])("$name returns to its start after $period generations", ({ rows, period }) => {
    expect(after(rows, 1)).not.toEqual(rows);
    expect(after(rows, period)).toEqual(rows);
  });
});

describe("nextGeneration: spaceships and the wrapping board", () => {
  const glider = gridFromRows([".O.", "..O", "OOO"]);

  it("moves a glider one cell diagonally every 4 generations", () => {
    const start = placePattern(createGrid(10, 10), glider, 2, 2);
    const expected = placePattern(createGrid(10, 10), glider, 3, 3);
    expect(gridToRows(advance(start, 4))).toEqual(gridToRows(expected));
  });

  it("flies a glider off one edge and back onto the opposite edge", () => {
    // 10x10 board: 40 generations = 10 diagonal moves = one lap
    const start = placePattern(createGrid(10, 10), glider, 2, 2);
    const halfway = advance(start, 20);

    expect(gridToRows(halfway)).not.toEqual(gridToRows(start));
    expect(population(halfway)).toBe(5);
    expect(gridToRows(advance(start, 40))).toEqual(gridToRows(start));
  });
});
