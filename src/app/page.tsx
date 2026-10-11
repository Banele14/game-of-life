import { GameOfLife } from "@/components/GameOfLife";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <GameOfLife />
      <footer className={styles.footer}>
        <p>
          Click or drag to draw.
          <span className={styles.keys}>
            {" "}
            Space to play or pause, → to step, R for random, C to clear.
          </span>
        </p>
        <a href="https://github.com/Banele14/game-of-life">Source</a>
      </footer>
    </main>
  );
}
