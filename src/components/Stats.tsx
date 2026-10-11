import styles from "./Stats.module.css";

interface StatsProps {
  generation: number;
  population: number;
  running: boolean;
}

export function Stats({ generation, population, running }: StatsProps) {
  const status = getStatus(generation, population, running);

  return (
    // Announce after a step, but not 10+ times a second while running.
    <dl className={`glass ${styles.stats}`} aria-live={running ? "off" : "polite"}>
      <div>
        <dt>Generation</dt>
        <dd data-testid="generation">{generation}</dd>
      </div>
      <div>
        <dt>Population</dt>
        <dd data-testid="population">{population}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd data-testid="status">
          <span className={`${styles.dot} ${styles[status.tone]}`} aria-hidden="true" />
          {status.label}
        </dd>
      </div>
    </dl>
  );
}

function getStatus(generation: number, population: number, running: boolean) {
  if (running) return { label: "Running", tone: "running" } as const;
  if (population === 0 && generation > 0) return { label: "Extinct", tone: "extinct" } as const;
  if (population === 0) return { label: "Empty", tone: "idle" } as const;
  return { label: "Paused", tone: "idle" } as const;
}
