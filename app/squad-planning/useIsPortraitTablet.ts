"use client";

import * as React from "react";

const QUERY = "(max-width: 1024px) and (orientation: portrait)";

export function useIsPortraitTablet() {
  const [isPortraitTablet, setIsPortraitTablet] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(QUERY);
    const update = () => setIsPortraitTablet(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isPortraitTablet;
}
