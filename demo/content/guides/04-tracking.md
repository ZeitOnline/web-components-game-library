# Tracking

Components never touch `window.dataLayer`. They emit a `zon-track` event with the payload the games already send today (same schema as `DataTracker` / `TrackingService`). The game decides how, or whether, to forward it.

## connectTracking

Call it once per game and pass the game entity:

```js
import { connectTracking } from '@zeitonline/game-components/tracking';

const disconnect = connectTracking({
  game: { name: 'sudoku', episode: '2026-10-15', difficulty: 'mittel' },
});
```

Each `zon-track` event then becomes one `dataLayer.push({ ...payload, game })`.

## Custom mapping

Wortgeflecht nests the data in `event_properties`. Pass `map` to reshape it, or return `null` to drop an event:

```js
connectTracking({
  map: (payload, component) => ({
    event: payload.event,
    event_properties: { ...payload, component, game: currentGame() },
  }),
});
```

Options:

| Option | Default | |
| --- | --- | --- |
| `target` | `document` | Where to listen |
| `game` | – | Added to every entry (without `map`) |
| `map(payload, component)` | – | Returns the entry, or `null` to skip |

## What the components send

| Component | Payload |
| --- | --- |
| Hero | `{ event: 'game_interaction', action: 'click', position: 'header_teaser' }` |
| Puzzle list | `{ event: 'game_interaction', action: 'click', position: 'game_cp' \| 'archive' }` |
| FAQ | `{ event: 'game_faq', action: 'open' \| 'click', target }` |
| Navigation | `{ event: 'game_interaction', action: 'click', target: <action>, position: 'ingame' }` |
| Result | `{ event: 'game_interaction', action: 'click', target: 'next' \| 'replay' \| 'share', position: 'closure_screen' }` |
| Dialog | `{ event: 'game_interaction', action: 'open' \| 'close', target: <id> }` |
| Instructions | `{ event: 'game_rules', action, position, max_position }` |

Every playground on this site logs the `zon-track` events next to the component events.
