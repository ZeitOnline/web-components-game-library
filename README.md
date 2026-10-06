# @zeitonline/game-components

Framework-agnostic web components for the UI that ZEIT ONLINE games share, used by both the Angular games (sudoku, wortiger, …) and the SvelteKit games (Wortgeflecht, Spiele CP). Plain JavaScript, no dependencies, themed through the `--z-ds-*` design tokens.

See [docs/PLAN.md](docs/PLAN.md) for the plan, integration and trade-offs.

```sh
npm run dev   # http://localhost:5173/demo/ (all components)
              # http://localhost:5173/demo/games.html (Sudoku ⇄ Wortgeflecht landing pages, fake routes)
```

In `games.html`, `<zon-game-navigation>` only appears on the game screen. Open a puzzle, or go straight to `games.html?game=sudoku#/sudoku/2026-10-05`.

## Try it locally in a game (without publishing to npm)

The package has no build step: it ships the plain ES modules from `src/`, so it can be packed and installed straight from disk.

Placeholders used below:

- `<path-to-library>`: your checkout of this repository
- `<path-to-game>`: the folder of the game's frontend `package.json`, e.g. the repo root for Wortgeflecht or `packages/frontend` for Sudoku

### 1. Pack the library

```sh
cd <path-to-library>
npm pack
# → zeitonline-game-components-<version>.tgz
```

### 2. Install the tarball in the game

```sh
cd <path-to-game>
npm install <path-to-library>/zeitonline-game-components-<version>.tgz
```

The path can be absolute or relative to `<path-to-game>`. This adds `"@zeitonline/game-components": "file:<path-to-library>/zeitonline-game-components-<version>.tgz"` to the game's `package.json`.

### 3. Import the components

SvelteKit: import them on the client only. The components extend `HTMLElement`, which doesn't exist during SSR.

```svelte
<script>
  import { onMount } from 'svelte';
  onMount(() => import('@zeitonline/game-components'));
</script>

<zon-game-hero category="word" game-name="Wortgeflecht" date="2026-10-06" href="/#11">
  <div slot="image"><Wortgeflecht size={210} /></div>
</zon-game-hero>
```

Angular: import once in `main.ts` and allow custom elements in the component.

```ts
// main.ts
import '@zeitonline/game-components/navigation';
import '@zeitonline/game-components/hero';

// component
@Component({ schemas: [CUSTOM_ELEMENTS_SCHEMA], template: `
  <zon-game-navigation heading="Sudoku Leicht" back-href="/" (zon-nav)="onNav($event.detail.action)" />
`})
```

Import single components (`/dialog`, `/hero`, `/navigation`, `/puzzle-list`, `/timer`, `/result`, `/instructions`, `/tracking`) to load only what the game uses. Type declarations are included.

### 4. After changing the library

Repeat steps 1 and 2. The tarball's hash changes on every pack, so it has to be installed again. Then restart the dev server. For Vite, use `--force` so it drops its cached copy:

```sh
npx vite dev --force
```

### Gotchas

- **Never commit the `file:` dependency.** Revert the change to `package.json` and `package-lock.json` before pushing: CI can't resolve a path on your machine.
- **Width inside flex layouts:** `zon-game-hero` and `zon-puzzle-list` always take 100% of the available width. Put them in a container with the width you want.
- **Slotting into an `<svg>`:** Svelte's types don't allow `slot` on an `<svg>`. Wrap it: `<div slot="image"><svg>…</svg></div>`.
- **Port clashes:** if the game's dev port already serves something else (e.g. this demo on 5173), start the game on another port with `--port <port>`.

| Element | Purpose |
| --- | --- |
| `<zon-game-dialog>` | Modal / bottom sheet / fullscreen (paywall) on native `<dialog>` |
| `<zon-game-instructions>` | "So wird gespielt" stepper |
| `<zon-game-timer>` | Stopwatch with pause |
| `<zon-game-result>` | End-of-game screen with stats, share and next/replay |
| `<zon-game-hero>` | Landing-page start banner (badge, game name, date, CTA, illustration) |
| `<zon-game-navigation>` | In-game header: back / archive / title / theme or hint / more, plus custom buttons with callbacks |
| `<zon-puzzle-list>` | "Weitere … Rätsel" grid with status badges and "Alle anzeigen" |

The API of each component (attributes, properties, slots, events) is documented at the top of its file in `src/components/`.

All components emit `zon-track` events instead of writing to `dataLayer`; call `connectTracking({ game })` once per game to forward them.

Game colours come from the `category` attribute (`logic`, `word`, `crossword`, `mini`, `quiz`), which maps to the frame tokens `--z-ds-color-games-<category>-base/soft/bold`. Game artwork is passed in through slots or properties, never built into the components.
