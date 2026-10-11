import { describe, expect, it } from "vitest";
import { createGrid, gridFromRows, gridToRows, population } from "../life";
import {
  clampSpeed,
  createInitialState,
  DRAWN_LABEL,
  EMPTY_LABEL,
  type SimulationState,
  simulationReducer as reduce,
} from "./reducer";
import { DEFAULT_SPEED, MAX_SPEED, MIN_SPEED } from "./settings";

const blinker = () => gridFromRows([".....", ".....", ".OOO.", ".....", "....."]);
const glider = { name: "Glider", note: "A spaceship." };

// a blinker, optionally already running
const withLife = (overrides: Partial<SimulationState> = {}): SimulationState => ({
  ...createInitialState(blinker()),
  ...overrides,
});

describe("simulationReducer", () => {
  describe("step", () => {
    it("advances the grid one generation and counts it", () => {
      const next = reduce(withLife(), { type: "step" });
      expect(next.generation).toBe(1);
      expect(gridToRows(next.grid)).toEqual([".....", "..O..", "..O..", "..O..", "....."]);
    });

    it("pauses automatically when the population dies out", () => {
      const lonely = gridFromRows(["...", ".O.", "..."]);
      const state = { ...createInitialState(lonely), running: true };
      const next = reduce(state, { type: "step" });
      expect(population(next.grid)).toBe(0);
      expect(next.running).toBe(false);
    });

    it("keeps running while there is life", () => {
      expect(reduce(withLife({ running: true }), { type: "step" }).running).toBe(true);
    });
  });

  describe("play, pause and togglePlay", () => {
    it("starts and stops the simulation", () => {
      const playing = reduce(withLife(), { type: "play" });
      expect(playing.running).toBe(true);
      expect(reduce(playing, { type: "pause" }).running).toBe(false);
    });

    it("toggles between running and paused", () => {
      const once = reduce(withLife(), { type: "togglePlay" });
      const twice = reduce(once, { type: "togglePlay" });
      expect(once.running).toBe(true);
      expect(twice.running).toBe(false);
    });

    it("refuses to play an empty board", () => {
      const empty = createInitialState(createGrid(5, 5));
      expect(reduce(empty, { type: "play" }).running).toBe(false);
      expect(reduce(empty, { type: "togglePlay" }).running).toBe(false);
    });

    it("returns the same state object when nothing changes", () => {
      const paused = withLife();
      expect(reduce(paused, { type: "pause" })).toBe(paused);
      const playing = withLife({ running: true });
      expect(reduce(playing, { type: "play" })).toBe(playing);
    });
  });

  describe("setSpeed", () => {
    it("sets the speed within limits", () => {
      expect(reduce(withLife(), { type: "setSpeed", speed: 25 }).speed).toBe(25);
      expect(reduce(withLife(), { type: "setSpeed", speed: 999 }).speed).toBe(MAX_SPEED);
    });
  });

  describe("paint", () => {
    it("brings cells to life and marks the board as custom", () => {
      const state = createInitialState(createGrid(5, 5));
      const next = reduce(state, {
        type: "paint",
        cells: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        alive: true,
      });
      expect(population(next.grid)).toBe(2);
      expect(next.label).toBe(DRAWN_LABEL);
    });

    it("can erase cells", () => {
      const next = reduce(withLife(), { type: "paint", cells: [{ x: 2, y: 2 }], alive: false });
      expect(population(next.grid)).toBe(2);
    });

    it("returns the same state when painting changes nothing", () => {
      const state = withLife();
      expect(reduce(state, { type: "paint", cells: [{ x: 0, y: 0 }], alive: false })).toBe(state);
    });

    it("does not stop a running simulation", () => {
      const next = reduce(withLife({ running: true }), {
        type: "paint",
        cells: [{ x: 0, y: 0 }],
        alive: true,
      });
      expect(next.running).toBe(true);
    });
  });

  describe("clear", () => {
    it("empties the board, resets the count and stops", () => {
      const busy = withLife({ running: true, generation: 42 });
      const next = reduce(busy, { type: "clear" });
      expect(population(next.grid)).toBe(0);
      expect(next.generation).toBe(0);
      expect(next.running).toBe(false);
      expect(next.label).toBe(EMPTY_LABEL);
    });

    it("keeps the board size and the chosen speed", () => {
      const next = reduce(withLife({ speed: 30 }), { type: "clear" });
      expect(next.grid.width).toBe(5);
      expect(next.speed).toBe(30);
    });
  });

  describe("load", () => {
    it("replaces the board, resets the count and pauses", () => {
      const grid = gridFromRows([".O.", "..O", "OOO"]);
      const next = reduce(withLife({ running: true, generation: 9 }), {
        type: "load",
        grid,
        label: glider,
      });
      expect(next.grid).toBe(grid);
      expect(next.generation).toBe(0);
      expect(next.running).toBe(false);
      expect(next.label).toBe(glider);
    });
  });

  it("never mutates the previous state", () => {
    const state = withLife();
    const snapshot = structuredClone(state);
    reduce(state, { type: "step" });
    reduce(state, { type: "paint", cells: [{ x: 0, y: 0 }], alive: true });
    reduce(state, { type: "clear" });
    expect(state).toEqual(snapshot);
  });
});

describe("clampSpeed", () => {
  it.each([
    { input: 0, expected: MIN_SPEED },
    { input: -10, expected: MIN_SPEED },
    { input: 12.6, expected: 13 },
    { input: 1000, expected: MAX_SPEED },
    { input: Number.NaN, expected: DEFAULT_SPEED },
  ])("clamps $input to $expected", ({ input, expected }) => {
    expect(clampSpeed(input)).toBe(expected);
  });
});
