import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

// jsdom has no canvas or ResizeObserver. Pixels are checked in Playwright.
HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never;

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
