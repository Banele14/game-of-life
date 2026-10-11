import { type Grid, isAlive } from "../life";

export interface BoardColours {
  readonly cell: string;
  readonly gridLine: string;
}

// Only the bits of CanvasRenderingContext2D we use, so tests can pass a fake.
export type DrawingContext = Pick<
  CanvasRenderingContext2D,
  | "fillStyle"
  | "strokeStyle"
  | "lineWidth"
  | "clearRect"
  | "beginPath"
  | "moveTo"
  | "lineTo"
  | "stroke"
  | "roundRect"
  | "fill"
>;

// Sizes are device pixels (CSS px * devicePixelRatio).
export function drawBoard(
  ctx: DrawingContext,
  grid: Grid,
  widthPx: number,
  heightPx: number,
  colours: BoardColours,
): void {
  const cellWidth = widthPx / grid.width;
  const cellHeight = heightPx / grid.height;

  ctx.clearRect(0, 0, widthPx, heightPx);

  ctx.strokeStyle = colours.gridLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  // +0.5 keeps 1px lines on a single pixel row instead of blurring across two
  for (let i = 1; i < grid.width; i++) {
    const x = Math.round(i * cellWidth) + 0.5;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, heightPx);
  }
  for (let i = 1; i < grid.height; i++) {
    const y = Math.round(i * cellHeight) + 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(widthPx, y);
  }
  ctx.stroke();

  // One path, one fill() for every live cell.
  const inset = Math.max(1, Math.round(Math.min(cellWidth, cellHeight) * 0.1));
  const radius = Math.min(cellWidth, cellHeight) * 0.28;
  ctx.fillStyle = colours.cell;
  ctx.beginPath();
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      if (!isAlive(grid, x, y)) continue;
      const left = Math.round(x * cellWidth) + inset;
      const top = Math.round(y * cellHeight) + inset;
      const right = Math.round((x + 1) * cellWidth) - inset;
      const bottom = Math.round((y + 1) * cellHeight) - inset;
      ctx.roundRect(left, top, right - left, bottom - top, radius);
    }
  }
  ctx.fill();
}
