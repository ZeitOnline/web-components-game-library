/**
 * Optional bridge from `zon-track` events to GTM's `window.dataLayer`.
 *
 * Components never touch the dataLayer themselves. Each game calls this once and
 * passes its game entity (the shape DataTracker / TrackingService already send),
 * or maps the events itself.
 *
 *   connectTracking({ game: { name: 'sudoku', episode, difficulty, publish_date } });
 */
export function connectTracking({ target = document, game, map } = {}) {
  const handler = (event) => {
    const { component, ...payload } = event.detail ?? {};
    const entry = map ? map(payload, component) : { ...payload, ...(game ? { game } : {}) };
    if (!entry) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(entry);
  };
  target.addEventListener('zon-track', handler);
  return () => target.removeEventListener('zon-track', handler);
}
