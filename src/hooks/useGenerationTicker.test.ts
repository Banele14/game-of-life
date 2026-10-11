import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGenerationTicker } from "./useGenerationTicker";

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useGenerationTicker", () => {
  it("does nothing while disabled", () => {
    const onTick = vi.fn();
    renderHook(() => useGenerationTicker(false, 10, onTick));
    vi.advanceTimersByTime(1000);
    expect(onTick).not.toHaveBeenCalled();
  });

  it.each([1, 10, 30])("ticks about %i times per second", (speed) => {
    const onTick = vi.fn();
    renderHook(() => useGenerationTicker(true, speed, onTick));
    vi.advanceTimersByTime(2000);
    // ticks land on ~16ms frames, so allow one either way
    expect(onTick.mock.calls.length).toBeGreaterThanOrEqual(speed * 2 - 1);
    expect(onTick.mock.calls.length).toBeLessThanOrEqual(speed * 2 + 1);
  });

  it("stops ticking when disabled and when unmounted", () => {
    const onTick = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ enabled }) => useGenerationTicker(enabled, 10, onTick),
      { initialProps: { enabled: true } },
    );
    vi.advanceTimersByTime(1000);
    const ticksWhileEnabled = onTick.mock.calls.length;

    rerender({ enabled: false });
    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(ticksWhileEnabled);

    rerender({ enabled: true });
    unmount();
    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(ticksWhileEnabled);
  });

  it("always calls the latest callback without restarting", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ cb }) => useGenerationTicker(true, 10, cb), {
      initialProps: { cb: first },
    });
    vi.advanceTimersByTime(500);
    rerender({ cb: second });
    vi.advanceTimersByTime(500);

    expect(first.mock.calls.length).toBeGreaterThan(0);
    expect(second.mock.calls.length).toBeGreaterThan(0);
  });
});
