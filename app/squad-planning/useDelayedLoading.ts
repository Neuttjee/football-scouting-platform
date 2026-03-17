import * as React from "react";

type Options = {
  /**
   * Delay before showing the loading UI. Helps avoid flicker for fast loads.
   */
  showDelayMs?: number;
  /**
   * Once shown, keep the loading UI visible for at least this long.
   */
  minShowMs?: number;
};

/**
 * Derives a stable `show` boolean from a potentially jittery `loading` flag.
 * - Won't show until `loading` has been true for `showDelayMs`.
 * - Once shown, it stays visible for at least `minShowMs`.
 */
export function useDelayedLoading(loading: boolean, options: Options = {}) {
  const { showDelayMs = 200, minShowMs = 300 } = options;

  const [show, setShow] = React.useState(false);
  const shownAtRef = React.useRef<number | null>(null);
  const delayTimerRef = React.useRef<number | null>(null);
  const minTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const clearTimers = () => {
      if (delayTimerRef.current != null) {
        window.clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      if (minTimerRef.current != null) {
        window.clearTimeout(minTimerRef.current);
        minTimerRef.current = null;
      }
    };

    if (loading) {
      // Already showing: keep it until loading ends (min duration is handled on hide).
      if (show) return () => clearTimers();

      clearTimers();
      delayTimerRef.current = window.setTimeout(() => {
        shownAtRef.current = Date.now();
        setShow(true);
      }, Math.max(0, showDelayMs));

      return () => clearTimers();
    }

    // Not loading.
    if (!show) return () => clearTimers();

    clearTimers();
    const shownAt = shownAtRef.current ?? Date.now();
    const elapsed = Date.now() - shownAt;
    const remaining = Math.max(0, minShowMs - elapsed);
    minTimerRef.current = window.setTimeout(() => {
      shownAtRef.current = null;
      setShow(false);
    }, remaining);

    return () => clearTimers();
    // Intentionally depend on show to schedule min duration when needed.
  }, [loading, show, showDelayMs, minShowMs]);

  return show;
}

