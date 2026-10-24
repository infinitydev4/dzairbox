export function trackEvent(kind: string, businessId?: string) {
  if (typeof navigator === "undefined") return;
  const body = JSON.stringify({ kind, businessId });
  if (navigator.sendBeacon)
    navigator.sendBeacon(
      "/api/events",
      new Blob([body], { type: "application/json" }),
    );
  else
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
}
