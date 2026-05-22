import { useCallback, useSyncExternalStore } from "react";

export function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function RelativeTime({ timestamp }: { timestamp: number }) {
  const subscribe = useCallback((callback: () => void) => {
    let id: ReturnType<typeof setTimeout>;

    function schedule() {
      id = setTimeout(() => {
        callback();
        schedule();
      }, nextTickMs(timestamp));
    }

    schedule();
    return () => clearTimeout(id);
  }, [timestamp]);

  const text = useSyncExternalStore(subscribe, () => formatRelative(timestamp));
  return <>{text}</>;
}

function nextTickMs(ts: number): number {
  const diff = Date.now() - ts;
  const s = diff / 1000;
  if (s < 60) return (60 - s) * 1000;
  if (s < 3600) return 60_000;
  if (s < 86400) return 3_600_000;
  return 86_400_000;
}
