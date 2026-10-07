import { useEffect, useState } from "react";

/** Marketing time used for SSR / first paint so hydration stays stable. */
export const PREVIEW_TIME = new Date(2026, 8, 25, 10, 10, 8);

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<Date>(PREVIEW_TIME);
  const [live, setLive] = useState(false);

  useEffect(() => {
    setNow(new Date());
    setLive(true);
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return { now, live };
}
