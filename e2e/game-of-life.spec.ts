import { expect, test } from "@playwright/test";
import { getBoard, openApp, readings } from "./helpers";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test("opens on the Gosper glider gun, paused", async ({ page }) => {
  const { generation, population, status, patternName } = readings(page);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Game of Life");
  await expect(patternName).toHaveText("Gosper glider gun");
  await expect(generation).toHaveText("0");
  await expect(population).toHaveText("36");
  await expect(status).toHaveText("Paused");
});

test("draws a blinker and steps it through both phases", async ({ page }) => {
  const board = await getBoard(page);
  const { generation, population } = readings(page);
  await page.getByRole("button", { name: "Clear" }).click();

  for (const x of [10, 11, 12]) await board.click(x, 10);
  await expect(population).toHaveText("3");
  expect(await board.isLit(10, 10)).toBe(true);
  expect(await board.isLit(11, 9)).toBe(false);

  await page.getByRole("button", { name: "Step" }).click();
  await expect(generation).toHaveText("1");
  expect(await board.isLit(11, 9)).toBe(true);
  expect(await board.isLit(11, 11)).toBe(true);
  expect(await board.isLit(10, 10)).toBe(false);

  await page.getByRole("button", { name: "Step" }).click();
  expect(await board.isLit(10, 10)).toBe(true);
  expect(await board.isLit(11, 9)).toBe(false);
  await expect(population).toHaveText("3");
});

test("clicking a live cell erases it", async ({ page }) => {
  const board = await getBoard(page);
  await page.getByRole("button", { name: "Clear" }).click();

  await board.click(5, 5);
  await expect(readings(page).population).toHaveText("1");
  await board.click(5, 5);
  await expect(readings(page).population).toHaveText("0");
});

test("tapping draws on touch screens", async ({ page, hasTouch }) => {
  test.skip(!hasTouch, "touch only");
  const board = await getBoard(page);
  await page.getByRole("button", { name: "Clear" }).click();

  await board.tap(20, 10);
  await expect(readings(page).population).toHaveText("1");
  expect(await board.isLit(20, 10)).toBe(true);
});

test("a fast drag still draws an unbroken line", async ({ page }) => {
  const board = await getBoard(page);
  await page.getByRole("button", { name: "Clear" }).click();

  // one move event from column 5 to 15; the 9 cells in between get filled in
  await board.drag([5, 20], [15, 20]);
  await expect(readings(page).population).toHaveText("11");
  expect(await board.isLit(10, 20)).toBe(true);
});

test("a glider keeps its five cells while it flies", async ({ page }) => {
  const { generation, population, status, patternSelect } = readings(page);
  await patternSelect.selectOption("glider");
  await page.getByRole("button", { name: "Play" }).click();
  await expect(status).toHaveText("Running");

  await expect.poll(async () => Number(await generation.textContent())).toBeGreaterThan(8);
  await page.getByRole("button", { name: "Pause" }).click();

  await expect(status).toHaveText("Paused");
  await expect(population).toHaveText("5");
});

test("a lone cell dies and the simulation stops itself", async ({ page }) => {
  const board = await getBoard(page);
  const { status } = readings(page);
  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page.getByRole("button", { name: "Play" })).toBeDisabled();

  await board.click(30, 20);
  await page.getByRole("button", { name: "Play" }).click();

  await expect(status).toHaveText("Extinct");
  await expect(page.getByRole("button", { name: "Play" })).toBeDisabled();
});

test("keyboard shortcuts", async ({ page }) => {
  const { generation, population, status, patternName } = readings(page);

  await page.keyboard.press("ArrowRight");
  await expect(generation).toHaveText("1");

  await page.keyboard.press("c");
  await expect(population).toHaveText("0");

  await page.keyboard.press("r");
  await expect(patternName).toHaveText("Random");

  await page.keyboard.press("Space");
  await expect(status).toHaveText("Running");
  await page.keyboard.press("Space");
  await expect(status).not.toHaveText("Running");
});
