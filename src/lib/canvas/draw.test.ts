import { describe, expect, it, vi } from "vitest";
import { gridFromRows } from "../life";
import { type DrawingContext, drawBoard } from "./draw";

function fakeContext(): DrawingContext {
  return {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
  };
}

const colours = { cell: "white", gridLine: "grey" };

describe("drawBoard", () => {
  it("draws one shape per live cell and fills them in a single call", () => {
    const ctx = fakeContext();
    drawBoard(ctx, gridFromRows([".O.", "..O", "OOO"]), 300, 300, colours);

    expect(ctx.roundRect).toHaveBeenCalledTimes(5);
    expect(ctx.fill).toHaveBeenCalledTimes(1);
    expect(ctx.fillStyle).toBe("white");
  });

  it("keeps each cell inside its own square", () => {
    const ctx = fakeContext();
    drawBoard(ctx, gridFromRows(["...", "...", "..O"]), 300, 300, colours);

    // cell (2, 2) covers 200..300 on both axes
    const [left, top, width, height] = vi.mocked(ctx.roundRect).mock.calls[0];
    expect(left).toBeGreaterThan(200);
    expect(top).toBeGreaterThan(200);
    expect(left + width).toBeLessThan(300);
    expect(top + height).toBeLessThan(300);
  });

  it("clears the previous frame first", () => {
    const ctx = fakeContext();
    drawBoard(ctx, gridFromRows(["...", "...", "..."]), 90, 60, colours);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 90, 60);
    expect(ctx.roundRect).not.toHaveBeenCalled();
  });
});
