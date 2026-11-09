/**
 * Optional bridge from `zon-track` events to GTM's `window.dataLayer`.
 *
 * Components never touch the dataLayer themselves. Each game calls this once and
 * passes its game entity (the shape DataTracker / TrackingService already send),
 * or maps the events itself.
 *
 *   connectTracking({ game: { name: 'sudoku', episode, difficulty, publish_date } });
 */
export interface TrackingOptions {
  /** Where to listen for `zon-track` (default: document). */
  target?: EventTarget;
  /** Added as `game` to every entry (ignored when `map` is given). */
  game?: Record<string, unknown>;
  /** Builds the dataLayer entry yourself; return null/undefined to drop the event. */
  map?: (payload: Record<string, unknown>, component?: string) => Record<string, unknown> | null | undefined;
}

// Not declared on the global Window: a game's own `dataLayer` typing would clash with it.
type DataLayerWindow = Window & { dataLayer?: unknown[] };

/** Starts forwarding. Returns a function that stops it. */
export function connectTracking({ target = document, game, map }: TrackingOptions = {}): () => void {
  const handler = (event: Event) => {
    const detail = ((event as CustomEvent).detail ?? {}) as Record<string, unknown>;
    const { component, ...payload } = detail;
    const entry = map ? map(payload, component as string | undefined) : { ...payload, ...(game ? { game } : {}) };
    if (!entry) return;
    const w = window as DataLayerWindow;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(entry);
  };
  target.addEventListener('zon-track', handler);
  return () => target.removeEventListener('zon-track', handler);
}
