import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readings } from "./helpers";

test("no WCAG A/AA violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});

test("works from the keyboard alone", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Play" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(readings(page).status).toHaveText("Running");
});
