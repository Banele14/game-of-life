import { findPattern, type Pattern, PATTERNS } from "@/lib/life";
import { MAX_SPEED, MIN_SPEED } from "@/lib/simulation";
import styles from "./Controls.module.css";
import { ChevronIcon, ClearIcon, PauseIcon, PlayIcon, RandomIcon, StepIcon } from "./icons";

interface ControlsProps {
  running: boolean;
  canPlay: boolean;
  speed: number;
  onTogglePlay: () => void;
  onStep: () => void;
  onRandomise: () => void;
  onClear: () => void;
  onSpeedChange: (speed: number) => void;
  onLoadPattern: (pattern: Pattern) => void;
}

export function Controls({
  running,
  canPlay,
  speed,
  onTogglePlay,
  onStep,
  onRandomise,
  onClear,
  onSpeedChange,
  onLoadPattern,
}: ControlsProps) {
  return (
    <div className={`glass ${styles.dock}`}>
      <button
        type="button"
        className={`${styles.button} ${styles.primary}`}
        onClick={onTogglePlay}
        disabled={!running && !canPlay}
        aria-label={running ? "Pause" : "Play"}
        title={running ? "Pause (Space)" : "Play (Space)"}
      >
        {running ? <PauseIcon /> : <PlayIcon />}
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={onStep}
        disabled={running}
        aria-label="Step"
        title="Step (→)"
      >
        <StepIcon />
      </button>

      <span className={styles.divider} />

      <button
        type="button"
        className={styles.button}
        onClick={onRandomise}
        aria-label="Random"
        title="Random (R)"
      >
        <RandomIcon />
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={onClear}
        aria-label="Clear"
        title="Clear (C)"
      >
        <ClearIcon />
      </button>

      <span className={styles.divider} />

      <div className={styles.speed}>
        <input
          type="range"
          min={MIN_SPEED}
          max={MAX_SPEED}
          step={1}
          value={speed}
          aria-label="Speed"
          aria-valuetext={`${speed} generations per second`}
          onChange={(event) => onSpeedChange(event.currentTarget.valueAsNumber)}
        />
        <output>{speed}/s</output>
      </div>

      <span className={styles.divider} />

      {/* Always shows "Patterns", so picking the same one twice still reloads it. */}
      <div className={styles.select}>
        <select
          aria-label="Pattern"
          value=""
          onChange={(event) => {
            const pattern = findPattern(event.currentTarget.value);
            if (pattern) onLoadPattern(pattern);
          }}
        >
          <option value="" disabled>
            Patterns
          </option>
          {PATTERNS.map((pattern) => (
            <option key={pattern.id} value={pattern.id}>
              {pattern.name}
            </option>
          ))}
        </select>
        <ChevronIcon />
      </div>
    </div>
  );
}
