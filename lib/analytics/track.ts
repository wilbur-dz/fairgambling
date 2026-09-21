/** Lightweight analytics shim — production PostHog wiring can replace this. */
export function track(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[track]", event, properties ?? {});
  }
}
