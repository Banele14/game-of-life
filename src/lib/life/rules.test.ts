import { describe, expect, it } from "vitest";
import { nextCellState } from "./rules";

// Only 18 possible inputs (alive/dead x 0-8 neighbours), so test all of them.
describe("nextCellState (B3/S23)", () => {
  const liveCell = [
    { neighbours: 0, expected: false, rule: "dies of underpopulation" },
    { neighbours: 1, expected: false, rule: "dies of underpopulation" },
    { neighbours: 2, expected: true, rule: "survives" },
    { neighbours: 3, expected: true, rule: "survives" },
    { neighbours: 4, expected: false, rule: "dies of overpopulation" },
    { neighbours: 5, expected: false, rule: "dies of overpopulation" },
    { neighbours: 6, expected: false, rule: "dies of overpopulation" },
    { neighbours: 7, expected: false, rule: "dies of overpopulation" },
    { neighbours: 8, expected: false, rule: "dies of overpopulation" },
  ];

  const deadCell = [
    { neighbours: 0, expected: false, rule: "stays dead" },
    { neighbours: 1, expected: false, rule: "stays dead" },
    { neighbours: 2, expected: false, rule: "stays dead" },
    { neighbours: 3, expected: true, rule: "is born (reproduction)" },
    { neighbours: 4, expected: false, rule: "stays dead" },
    { neighbours: 5, expected: false, rule: "stays dead" },
    { neighbours: 6, expected: false, rule: "stays dead" },
    { neighbours: 7, expected: false, rule: "stays dead" },
    { neighbours: 8, expected: false, rule: "stays dead" },
  ];

  it.each(liveCell)("a live cell with $neighbours neighbours $rule", ({ neighbours, expected }) => {
    expect(nextCellState(true, neighbours)).toBe(expected);
  });

  it.each(deadCell)("a dead cell with $neighbours neighbours $rule", ({ neighbours, expected }) => {
    expect(nextCellState(false, neighbours)).toBe(expected);
  });
});
