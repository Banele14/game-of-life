import { expect, type Page } from "@playwright/test";

// The page is pre-rendered, so the controls are on screen a moment before
// React hydrates and attaches its handlers. A key press in that gap does
// nothing (this made the keyboard test flaky on mobile). The board is only
// drawn after hydration, so wait for the first non-transparent pixel.
export async function openApp(page: Page) {
  await page.goto("/");
  await page.waitForFunction(() => {
    const canvas = document.querySelector("canvas");
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return false;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let alpha = 3; alpha < data.length; alpha += 4) {
      if (data[alpha] > 0) return true;
    }
    return false;
  });
}

// Board helpers that work in grid coordinates, converting to screen
// positions the same way the app does.
export async function getBoard(page: Page) {
  const canvas = page.getByRole("img", { name: /Game board/ });
  await expect(canvas).toBeVisible();

  const columns = Number(await canvas.getAttribute("data-columns"));
  const rows = Number(await canvas.getAttribute("data-rows"));

  const centreOf = async (x: number, y: number) => {
    // on small screens pressing a control can scroll the board away
    await canvas.scrollIntoViewIfNeeded();
    const box = (await canvas.boundingBox())!;
    return {
      x: box.x + ((x + 0.5) * box.width) / columns,
      y: box.y + ((y + 0.5) * box.height) / rows,
    };
  };

  return {
    canvas,

    async click(x: number, y: number) {
      const point = await centreOf(x, y);
      await page.mouse.click(point.x, point.y);
    },

    async tap(x: number, y: number) {
      const point = await centreOf(x, y);
      await page.touchscreen.tap(point.x, point.y);
    },

    // press on one cell, release on another, in a single move event
    async drag(from: [number, number], to: [number, number]) {
      const start = await centreOf(...from);
      const end = await centreOf(...to);
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
      await page.mouse.move(end.x, end.y, { steps: 1 });
      await page.mouse.up();
    },

    // reads the real pixel in the middle of a cell
    async isLit(x: number, y: number): Promise<boolean> {
      return canvas.evaluate(
        (element, { x, y, columns, rows }) => {
          const canvasElement = element as HTMLCanvasElement;
          const ctx = canvasElement.getContext("2d")!;
          const px = Math.floor(((x + 0.5) * canvasElement.width) / columns);
          const py = Math.floor(((y + 0.5) * canvasElement.height) / rows);
          const [r, g, b, a] = ctx.getImageData(px, py, 1, 1).data;
          return a > 200 && r > 200 && g > 200 && b > 200; // live cells are near-white
        },
        { x, y, columns, rows },
      );
    },
  };
}

export const readings = (page: Page) => ({
  generation: page.getByTestId("generation"),
  population: page.getByTestId("population"),
  status: page.getByTestId("status"),
  patternName: page.getByTestId("pattern-name"),
  patternSelect: page.getByRole("combobox", { name: "Pattern" }),
});
