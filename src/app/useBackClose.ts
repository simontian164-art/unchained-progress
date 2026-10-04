import { useEffect, useRef } from "react";

/**
 * Full-screen overlays join the browser history, so the gestures people already use work:
 * iOS edge-swipe back, Android back button and the browser Back button close the overlay
 * instead of leaving the page underneath.
 */
export function useBackClose(open: boolean, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!open) return;
    window.history.pushState({ ...(window.history.state ?? {}), gmOverlay: true }, "");
    let popped = false;
    const onPop = () => {
      popped = true;
      closeRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      // Closed from the UI (button, Escape, tap): remove the entry we added.
      if (!popped && window.history.state?.gmOverlay) window.history.back();
    };
  }, [open]);
}
