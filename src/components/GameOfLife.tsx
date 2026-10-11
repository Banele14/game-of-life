"use client";

import { useMemo, useReducer } from "react";
import { useGenerationTicker } from "@/hooks/useGenerationTicker";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { findPattern, loadPattern, type Pattern, population, randomGrid } from "@/lib/life";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  type BoardLabel,
  createInitialState,
  RANDOM_DENSITY,
  simulationReducer,
} from "@/lib/simulation";
import { Board } from "./Board";
import { Controls } from "./Controls";
import styles from "./GameOfLife.module.css";
import { Stats } from "./Stats";

const RANDOM_LABEL: BoardLabel = {
  name: "Random",
  note: `Each cell started alive with a ${RANDOM_DENSITY * 100}% chance.`,
};

const labelFor = (pattern: Pattern): BoardLabel => ({
  name: pattern.name,
  note: `${pattern.family}. ${pattern.note}`,
});

// Starts on a fixed pattern, not a random board: the page is pre-rendered at
// build time and a random start wouldn't match on hydration.
function createStartingState() {
  const gun = findPattern("gosper-glider-gun")!;
  return createInitialState(loadPattern(gun, BOARD_WIDTH, BOARD_HEIGHT), labelFor(gun));
}

export function GameOfLife() {
  const [state, dispatch] = useReducer(simulationReducer, undefined, createStartingState);
  const { grid, generation, running, speed, label } = state;
  const livingCells = useMemo(() => population(grid), [grid]);

  useGenerationTicker(running, speed, () => dispatch({ type: "step" }));

  const togglePlay = () => dispatch({ type: "togglePlay" });
  const step = () => {
    if (!running) dispatch({ type: "step" });
  };
  const randomise = () =>
    dispatch({
      type: "load",
      grid: randomGrid(BOARD_WIDTH, BOARD_HEIGHT, RANDOM_DENSITY),
      label: RANDOM_LABEL,
    });
  const clear = () => dispatch({ type: "clear" });
  const loadPreset = (pattern: Pattern) =>
    dispatch({
      type: "load",
      grid: loadPattern(pattern, BOARD_WIDTH, BOARD_HEIGHT),
      label: labelFor(pattern),
    });

  useKeyboardShortcuts({
    " ": togglePlay,
    arrowright: step,
    r: randomise,
    c: clear,
  });

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Game of Life</h1>
          <p className={styles.label} title={`${label.name} · ${label.note}`}>
            <span data-testid="pattern-name">{label.name}</span>
            <span className={styles.note}> · {label.note}</span>
          </p>
        </div>
        <Stats generation={generation} population={livingCells} running={running} />
      </header>

      <div className={`glass ${styles.board}`}>
        <Board grid={grid} onPaint={(cells, alive) => dispatch({ type: "paint", cells, alive })} />
      </div>

      <Controls
        running={running}
        canPlay={livingCells > 0}
        speed={speed}
        onTogglePlay={togglePlay}
        onStep={step}
        onRandomise={randomise}
        onClear={clear}
        onSpeedChange={(value) => dispatch({ type: "setSpeed", speed: value })}
        onLoadPattern={loadPreset}
      />
    </>
  );
}
