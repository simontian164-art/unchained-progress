import { useEffect, useRef } from "react";

/** While `open`, the browser/phone Back button closes the overlay instead of leaving the page. */
export function useBackClose(open: boolean, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!open) return;
    window.history.pushState({ backClose: true }, "");
    let poppedByBack = false;
    const onPop = () => {
      poppedByBack = true;
      closeRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      // Closed some other way: drop the extra history entry we added.
      if (!poppedByBack && window.history.state?.backClose) window.history.back();
    };
  }, [open]);
}
