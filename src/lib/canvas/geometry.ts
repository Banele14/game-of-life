import type { Cell } from "../life";

export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

// Works on proportions of the on-screen rect, so CSS scaling doesn't matter.
// Points just outside the board clamp to the nearest edge cell.
export function pointToCell(
  clientX: number,
  clientY: number,
  rect: Rect,
  columns: number,
  rows: number,
): Cell {
  const x = Math.floor(((clientX - rect.left) / rect.width) * columns);
  const y = Math.floor(((clientY - rect.top) / rect.height) * rows);
  return { x: clamp(x, 0, columns - 1), y: clamp(y, 0, rows - 1) };
}

// Bresenham's line, both ends included. Pointer events are sampled, so a fast
// drag can skip cells between two events; this fills the gap.
export function cellsOnLine(from: Cell, to: Cell): Cell[] {
  const cells: Cell[] = [];
  const dx = Math.abs(to.x - from.x);
  const dy = -Math.abs(to.y - from.y);
  const stepX = from.x < to.x ? 1 : -1;
  const stepY = from.y < to.y ? 1 : -1;
  let error = dx + dy;
  let { x, y } = from;

  while (true) {
    cells.push({ x, y });
    if (x === to.x && y === to.y) return cells;
    const doubled = 2 * error;
    if (doubled >= dy) {
      error += dy;
      x += stepX;
    }
    if (doubled <= dx) {
      error += dx;
      y += stepY;
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
