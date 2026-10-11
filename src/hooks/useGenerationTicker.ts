import { useEffect, useEffectEvent } from "react";

// Calls onTick ~ticksPerSecond times a second while enabled. rAF rather than
// setInterval: ticks line up with repaints and pause in background tabs.
export function useGenerationTicker(
  enabled: boolean,
  ticksPerSecond: number,
  onTick: () => void,
): void {
  // lets the loop call the latest onTick without being restarted on every render
  const tick = useEffectEvent(onTick);

  useEffect(() => {
    if (!enabled) return;

    const interval = 1000 / ticksPerSecond;
    let lastTick = performance.now();
    let frame = requestAnimationFrame(function loop(now) {
      if (now - lastTick >= interval) {
        // step in whole intervals to keep the average rate right, but never
        // fall more than one behind (e.g. coming back to a hidden tab)
        lastTick = Math.max(lastTick + interval, now - interval);
        tick();
      }
      frame = requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(frame);
  }, [enabled, ticksPerSecond]);
}
