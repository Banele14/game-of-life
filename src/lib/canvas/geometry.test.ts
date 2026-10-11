import { describe, expect, it } from "vitest";
import { cellsOnLine, pointToCell } from "./geometry";

describe("pointToCell", () => {
  // 64x40 board drawn at 640x400, offset 100px
  const rect = { left: 100, top: 100, width: 640, height: 400 };
  const cellAt = (x: number, y: number) => pointToCell(x, y, rect, 64, 40);

  it("finds the cell under the pointer", () => {
    expect(cellAt(100, 100)).toEqual({ x: 0, y: 0 });
    expect(cellAt(115, 125)).toEqual({ x: 1, y: 2 });
    expect(cellAt(739, 499)).toEqual({ x: 63, y: 39 });
  });

  it("works when CSS scales the canvas", () => {
    const half = { left: 0, top: 0, width: 320, height: 200 };
    expect(pointToCell(160, 100, half, 64, 40)).toEqual({ x: 32, y: 20 });
  });

  it("clamps positions just outside the board onto the edge", () => {
    expect(cellAt(90, 90)).toEqual({ x: 0, y: 0 });
    expect(cellAt(800, 600)).toEqual({ x: 63, y: 39 });
  });
});

describe("cellsOnLine", () => {
  it("returns a single cell when start and end are the same", () => {
    expect(cellsOnLine({ x: 3, y: 3 }, { x: 3, y: 3 })).toEqual([{ x: 3, y: 3 }]);
  });

  it("fills a horizontal gap", () => {
    expect(cellsOnLine({ x: 0, y: 0 }, { x: 3, y: 0 })).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ]);
  });

  it("fills a diagonal gap in either direction", () => {
    expect(cellsOnLine({ x: 2, y: 2 }, { x: 0, y: 0 })).toEqual([
      { x: 2, y: 2 },
      { x: 1, y: 1 },
      { x: 0, y: 0 },
    ]);
  });

  it("produces an unbroken line for any slope", () => {
    const line = cellsOnLine({ x: 0, y: 0 }, { x: 7, y: 3 });
    expect(line.at(0)).toEqual({ x: 0, y: 0 });
    expect(line.at(-1)).toEqual({ x: 7, y: 3 });
    // no gaps
    for (let i = 1; i < line.length; i++) {
      expect(Math.abs(line[i].x - line[i - 1].x)).toBeLessThanOrEqual(1);
      expect(Math.abs(line[i].y - line[i - 1].y)).toBeLessThanOrEqual(1);
    }
  });
});
