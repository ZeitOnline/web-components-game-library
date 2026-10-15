# @zeitonline/game-components

Framework-agnostic web components for the UI that ZEIT ONLINE games share, used by both the Angular games (sudoku, wortiger, …) and the SvelteKit games (Wortgeflecht, Spiele CP). Plain JavaScript, no dependencies, themed through the `--z-ds-*` design tokens.

See [docs/PLAN.md](docs/PLAN.md) for the plan, integration and trade-offs.

## Docs and demo site

`demo/` is a SvelteKit app: documentation for every component (playground, anatomy, API, accessibility, tracking), the guides, and the Sudoku ⇄ Wortgeflecht demo. It depends on this package via `file:..`, exactly like a game would, so edits in `src/` show up on reload.

```sh
npm install --prefix demo   # once
npm run dev                 # http://localhost:5173            components + guides
                            # http://localhost:5173/games      Sudoku ⇄ Wortgeflecht, fake routes
npm run build:demo          # static site in demo/build
```

On `/games`, `<zon-game-navigation>` only appears on the game screen. Open a puzzle, or go straight to `/games?game=sudoku#/sudoku/2026-10-05`.

The docs data for each component lives in `demo/src/lib/components/<slug>.js`. When you change a component's API, update its doc comment and that file together.

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

Import single components (`/dialog`, `/hero`, `/navigation`, `/puzzle-list`, `/faq`, `/timer`, `/result`, `/instructions`, `/tracking`) to load only what the game uses. Type declarations are included.

Also load `critical.css` render-blocking in `<head>` (skeletons and FAQ styles, see below):

```jsonc
// Angular: angular.json → build options
"styles": ["node_modules/@zeitonline/game-components/src/critical.css", "src/styles.scss"]
```

```svelte
<!-- SvelteKit: root +layout.svelte -->
<script>import '@zeitonline/game-components/critical.css';</script>
```

## Skeletons (no flash on load)

Custom elements only render once their JavaScript has run. Until then, an empty tag takes no space: the page first shows the frame, then jumps when the hero and list appear. `critical.css` contains plain-HTML skeletons that paint immediately and have **the same size and breakpoints** as the components (checked at 375, 700 and 1000 px), so the swap doesn't move anything.

Put the skeleton **inside** the component tag. Once the element is defined, the skeleton disappears by itself (the shadow root has no default slot):

```html
<zon-game-hero category="logic" …>
  <div class="zon-skeleton zon-skeleton--hero" data-category="logic" aria-hidden="true">
    <div class="zon-skeleton__card">
      <div class="zon-skeleton__image"></div>
      <div class="zon-skeleton__content">
        <span class="zon-skeleton__bone zon-skeleton__badge"></span>
        <span class="zon-skeleton__text">
          <span class="zon-skeleton__bone zon-skeleton__title"></span>
          <span class="zon-skeleton__bone zon-skeleton__date"></span>
        </span>
        <span class="zon-skeleton__bone zon-skeleton__cta"></span>
      </div>
    </div>
  </div>
</zon-game-hero>

<zon-puzzle-list …>
  <div class="zon-skeleton zon-skeleton--puzzle-list" data-category="logic" aria-hidden="true">
    <div class="zon-skeleton__head">
      <span class="zon-skeleton__bone zon-skeleton__heading"></span>
      <span class="zon-skeleton__bone zon-skeleton__all"></span>
    </div>
    <ul>
      <!-- one <li> per expected row (default 4) -->
      <li><span class="zon-skeleton__bone zon-skeleton__tile"></span><span class="zon-skeleton__lines"><span class="zon-skeleton__bone zon-skeleton__supporter"></span><span class="zon-skeleton__bone zon-skeleton__date"></span></span></li>
    </ul>
  </div>
</zon-puzzle-list>
```

- **Angular:** `<app-root>` stays empty until the app has started, so put the skeletons inside `<app-root>` in `index.html` (not in a component template). Angular replaces them with the real components when it starts.
- **SvelteKit:** server-render the skeleton markup inside the tags; the components are imported client-only.
- `data-category` picks the game colours like the components' `category` attribute. `--zon-skeleton-columns` mirrors `columns` on the list.
- `zon-skeleton--faq` (one `<div class="zon-skeleton__question">` per question) is only needed when the FAQ is rendered by JavaScript.
- Try it: `/games?delay=2000` on the docs site holds the components back for 2 s.

## FAQ

`<zon-game-faq>` renders into the **light DOM** with native `<details>`, so the questions are in the HTML for search engines, and open/close works without JavaScript. Write the markup directly (static or server-rendered pages) or set `items` (Angular `[items]`, Svelte `items={…}`):

```html
<zon-game-faq exclusive structured-data>
  <details open>
    <summary><h2>Wie spielt man Sudoku?</h2></summary>
    <p>Ein Sudoku-Rätsel besteht aus …</p>
  </details>
</zon-game-faq>
```

The component adds `game_faq` tracking (`open` and link `click`, like Wortgeflecht) and, with `structured-data`, the schema.org `FAQPage` JSON-LD. `faqStructuredData(items)` returns the same object, for writing it into server-rendered HTML.

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
| `<zon-game-faq>` | FAQ accordion in the light DOM (SEO), native `<details>`, tracking, JSON-LD |
| `critical.css` | Skeletons for hero / list / FAQ and the FAQ styles, loaded in `<head>` |

The API of each component (attributes, properties, slots, events) is documented at the top of its file in `src/components/`.

All components emit `zon-track` events instead of writing to `dataLayer`; call `connectTracking({ game })` once per game to forward them.

Game colours come from the `category` attribute (`logic`, `word`, `crossword`, `mini`, `quiz`), which maps to the frame tokens `--z-ds-color-games-<category>-base/soft/bold`. Game artwork is passed in through slots or properties, never built into the components.
