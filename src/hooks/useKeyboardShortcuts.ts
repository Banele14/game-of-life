import { useEffect, useEffectEvent } from "react";

// keys are KeyboardEvent.key, lower-cased (" " for Space)
export type ShortcutMap = Readonly<Record<string, () => void>>;

// These already handle keys themselves (Space on a button, arrows on a slider...).
const IGNORED_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON"]);

export function useKeyboardShortcuts(shortcuts: ShortcutMap): void {
  const handle = useEffectEvent((event: KeyboardEvent) => {
    // leave Cmd+R, Ctrl+C etc. to the browser
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const target = event.target as HTMLElement | null;
    if (target && (IGNORED_TAGS.has(target.tagName) || target.isContentEditable)) return;

    const action = shortcuts[event.key.toLowerCase()];
    if (!action) return;

    event.preventDefault(); // stops Space scrolling the page
    action();
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handle(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
}
