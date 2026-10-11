import { centredPattern, type Grid, gridFromRows } from "./grid";

export interface Pattern {
  readonly id: string;
  readonly name: string;
  readonly family: "Spaceship" | "Oscillator" | "Gun" | "Methuselah";
  readonly note: string;
  readonly rows: readonly string[];
}

// Notes are checked against the engine in patterns.test.ts.
export const PATTERNS: readonly Pattern[] = [
  {
    id: "glider",
    name: "Glider",
    family: "Spaceship",
    note: "Moves one cell diagonally every 4 generations.",
    rows: [".O.", "..O", "OOO"],
  },
  {
    id: "lwss",
    name: "Lightweight spaceship",
    family: "Spaceship",
    note: "Moves two cells sideways every 4 generations.",
    rows: [".O..O", "O....", "O...O", "OOOO."],
  },
  {
    id: "pulsar",
    name: "Pulsar",
    family: "Oscillator",
    note: "Repeats every 3 generations.",
    rows: [
      "..OOO...OOO..",
      ".............",
      "O....O.O....O",
      "O....O.O....O",
      "O....O.O....O",
      "..OOO...OOO..",
      ".............",
      "..OOO...OOO..",
      "O....O.O....O",
      "O....O.O....O",
      "O....O.O....O",
      ".............",
      "..OOO...OOO..",
    ],
  },
  {
    id: "gosper-glider-gun",
    name: "Gosper glider gun",
    family: "Gun",
    note: "Fires a glider every 30 generations. They wrap round and hit it.",
    rows: [
      "........................O...........",
      "......................O.O...........",
      "............OO......OO............OO",
      "...........O...O....OO............OO",
      "OO........O.....O...OO..............",
      "OO........O...O.OO....O.O...........",
      "..........O.....O.......O...........",
      "...........O...O....................",
      "............OO......................",
    ],
  },
  {
    id: "r-pentomino",
    name: "R-pentomino",
    family: "Methuselah",
    note: "Five cells that take 1,103 generations to settle on an infinite board.",
    rows: [".OO", "OO.", ".O."],
  },
];

export function findPattern(id: string): Pattern | undefined {
  return PATTERNS.find((pattern) => pattern.id === id);
}

export function loadPattern(pattern: Pattern, width: number, height: number): Grid {
  return centredPattern(gridFromRows(pattern.rows), width, height);
}
