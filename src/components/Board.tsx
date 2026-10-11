"use client";

import { type PointerEvent, useEffect, useRef, useState } from "react";
import { type BoardColours, drawBoard } from "@/lib/canvas/draw";
import { cellsOnLine, pointToCell } from "@/lib/canvas/geometry";
import { type Cell, type Grid, isAlive } from "@/lib/life";
import styles from "./Board.module.css";

interface BoardProps {
  grid: Grid;
  onPaint: (cells: Cell[], alive: boolean) => void;
}

interface Stroke {
  // the whole stroke draws or erases, depending on the first cell touched
  alive: boolean;
  last: Cell;
}

export function Board({ grid, onPaint }: BoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokeRef = useRef<Stroke | null>(null);
  const coloursRef = useRef<BoardColours | null>(null);
  const [pixelSize, setPixelSize] = useState({ width: 0, height: 0 });

  // Match the backing store to the displayed size * devicePixelRatio,
  // otherwise it's blurry on retina screens.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(([entry]) => {
      const ratio = window.devicePixelRatio || 1;
      const width = Math.round(entry.contentRect.width * ratio);
      const height = Math.round(entry.contentRect.height * ratio);
      coloursRef.current = readColours(canvas);
      setPixelSize((current) =>
        current.width === width && current.height === height ? current : { width, height },
      );
    });

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const colours = coloursRef.current;
    if (!canvas || !ctx || !colours || pixelSize.width === 0) return;

    // setting width/height clears the canvas, so only touch them on resize
    if (canvas.width !== pixelSize.width) canvas.width = pixelSize.width;
    if (canvas.height !== pixelSize.height) canvas.height = pixelSize.height;

    drawBoard(ctx, grid, pixelSize.width, pixelSize.height, colours);
  }, [grid, pixelSize]);

  const cellAt = (event: PointerEvent<HTMLCanvasElement>): Cell =>
    pointToCell(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect(),
      grid.width,
      grid.height,
    );

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);

    const cell = cellAt(event);
    const alive = !isAlive(grid, cell.x, cell.y);
    strokeRef.current = { alive, last: cell };
    onPaint([cell], alive);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const stroke = strokeRef.current;
    if (!stroke) return;

    const cell = cellAt(event);
    if (cell.x === stroke.last.x && cell.y === stroke.last.y) return;

    onPaint(cellsOnLine(stroke.last, cell), stroke.alive);
    strokeRef.current = { ...stroke, last: cell };
  };

  const endStroke = () => {
    strokeRef.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      style={{ aspectRatio: `${grid.width} / ${grid.height}` }}
      role="img"
      aria-label={`Game board, ${grid.width} by ${grid.height} cells. Click or drag to draw cells.`}
      data-columns={grid.width}
      data-rows={grid.height}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endStroke}
      onPointerCancel={endStroke}
      onLostPointerCapture={endStroke}
    />
  );
}

// Same CSS variables as the rest of the page.
function readColours(element: HTMLElement): BoardColours {
  const style = getComputedStyle(element);
  return {
    cell: style.getPropertyValue("--cell").trim(),
    gridLine: style.getPropertyValue("--grid-line").trim(),
  };
}
