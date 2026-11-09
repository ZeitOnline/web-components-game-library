# Plan: Shared web components for ZEIT ONLINE games

Status: proposal · 2026-10-06

## 1. Problem

The games run on two frameworks. Sudoku (Angular 21) and Wortiger (Angular 20) are Angular apps. Wortgeflecht and Spiele CP (Svelte 5 / SvelteKit 2) are SvelteKit apps. The same UI sections have been copied from game to game and have drifted apart:

| Section | Sudoku | Wortiger | Wortgeflecht | Spiele CP |
|---|---|---|---|---|
| Modal / overlay | `commons/overlay` (CDK focus trap, div-based) | same copy, less a11y | `Dialog.svelte` + `DialogManager` (native `<dialog>`) | – |
| How-to-play stepper | `game/instructions` | `instructions` (+ legacy HTML branch) | `InstructionsDialog.svelte` | – |
| Result / closure screen | `closure-screen-metered` + widgets | same copy + share, fail state | `GameEndScreen.svelte` (no stats) | – |
| Timer | `game/stop-watch` | – | – | – |
| Header / toolbar | `game-header` | copy, no dark-mode toggle | `GameHeader.svelte` | – |
| "Mehr" menu | `more-screen` | copy | `OptionsDialog.svelte` | – |
| Paywall, USP / login teaser | `commons/components/paywall`, `usp-teaser` | copy | `paywall/*`, `zon-ecosystem/*` | – |
| Landing banner | `home/hero/start-teaser` | copy | – | `Header` (different) |
| "Weitere Rätsel" list | `archive-teaser` + `teaser` | copy | archive dialog | `PuzzleCard` |
| Games carousel / cards | `zonspiele-games-carousel` | copy | `ZeitGamesSection` | `Carousel`, `GameCard` |
| FAQ | static `.faq` in `index*.html` | copy (`.faq` in `index.html`) | `FAQSection` + JSON-LD | `FAQSection` (identical) |
| Toast / live region | – | `notifications` | `GameNotification` | – |

The same `src/commons/` folder (62 files) exists in both Angular repos. Eckchen, Hashi, Um die Ecke and Adventszeit most likely carry a copy too. None of the games has i18n; all strings are hardcoded German.

There is one thing every game already has in common: they all read the **`--z-ds-*` CSS custom properties** from the ZON frame / `@zeitonline/design-system`. CSS custom properties are inherited into Shadow DOM, so they are the natural theming contract for the shared components.

## 2. Approach

Use **framework-agnostic custom elements written in plain JavaScript**, with no runtime dependency. Both Angular and Svelte can consume them natively.

| Concern | Decision |
|---|---|
| Authoring | Vanilla `HTMLElement` subclasses with a tiny base class (`src/shared/base.ts`), written in TypeScript and compiled with `tsc` to `dist/` (the `prepare` script, so GitHub installs build it). No Lit/Stencil for now (see §4). |
| Encapsulation | Open Shadow DOM. Styles are shared **constructable stylesheets**, parsed once per page rather than once per instance. |
| Theming | Only through `--z-ds-*` tokens, with fallbacks copied from sudoku's `root-vars.scss`. Fine-tuning goes through `::part()` and a few `--zon-*` hooks (e.g. `--zon-dialog-max-width`). Fonts are inherited from the frame. |
| Data in | Primitives go in **attributes**: labels, variant, flags. Arrays and objects go in **properties** (`el.stats = [...]`), which Angular `[stats]` and Svelte `stats={...}` set automatically. Plain HTML / SSR can use a child `<script type="application/json">`. |
| Content | **Slots** carry game-specific parts (solution list, highscore widget, teasers), so the shell stays generic. |
| Data out | `CustomEvent`s with `bubbles + composed`, prefixed `zon-` (`zon-close`, `zon-step-change`, …). There are no callback props and no global singletons (replacing `DialogManager` / `OverlayService`). |
| Tracking | Components **never** touch `dataLayer`. They emit `zon-track` with the existing payload shape (`game_interaction`, `game_rules`, …). Each game connects once with `connectTracking({ game })` and adds its game entity. |
| i18n | Labels are attributes with German defaults (`next-label="Weiter"`). Moving to a translation layer later only means feeding these attributes. |
| a11y | Native `<dialog>` + `showModal()` (focus trap, inert background, Esc), focus returned to the opener, heading focus on open (as in Wortgeflecht), `prefers-reduced-motion`. |

### Already built (this repo)

| Element | Replaces | gzip* |
|---|---|---|
| `<zon-game-dialog>` | `zonspiele-overlay` + `OverlayService`, `Dialog.svelte` + `DialogManager` | 3.2 KB |
| `<zon-game-instructions>` | the three instruction steppers | 3.3 KB |
| `<zon-game-timer>` | sudoku `stop-watch` | 2.7 KB |
| `<zon-game-result>` | `closure-screen-metered` shell + statistic widget, `GameEndScreen` shell | 3.2 KB |
| `<zon-game-hero>` | sudoku/wortiger `start-teaser` (landing banner) | 3.1 KB |
| `<zon-puzzle-list>` | sudoku/wortiger `archive-teaser` + `teaser`, Spiele CP `PuzzleCard` rows | 4.2 KB |
| all six | | **9.9 KB** |

\*esbuild minified + gzip -9. Each per-component number includes the ~2 KB shared base.

`demo/games.html` puts them together as fake Sudoku and Wortgeflecht landing pages, with a switch at the top. Both use the same components; only attributes, slotted artwork and data change. The hero and list styles are a 1:1 port of the live sudoku.zeit.de CSS, and their measured sizes match the live page at 1280px and 390px. Colours come from the frame's `--z-ds-color-games-<category>-*` tokens through a `category` attribute. Start → rules dialog → game with timer → result. "Alle anzeigen" opens an archive dialog; locked days stand in for the paywall. All links are fake hash routes.

Hero and list use **container queries** instead of viewport media queries. They lay themselves out according to the space they get, so the same element works full-width in a game and inside a Spiele CP grid cell.

The demo (`npm run dev` → `/demo/`) was checked in headless Chromium and WebKit. It covers open/close, Esc on a persistent dialog, backdrop close, focus return, stepper navigation, tracking events and dark-mode token switching.

## 3. Integration

**Angular (sudoku, wortiger):**

```ts
// main.ts
import '@zeitonline/game-components/dialog';
import '@zeitonline/game-components/instructions';
import { connectTracking } from '@zeitonline/game-components/tracking';
connectTracking({ map: (p) => trackingService.toDataLayer(p) });

// component
@Component({ schemas: [CUSTOM_ELEMENTS_SCHEMA], template: `
  <zon-game-dialog [attr.open]="rulesOpen() ? '' : null" variant="wide" (zon-close)="rulesOpen.set(false)">
    <zon-game-instructions [steps]="GAME_INSTRUCTIONS" (zon-complete)="startGame()" />
  </zon-game-dialog>
  <zon-game-timer #timer autostart pause-when-hidden (zon-timer-pause)="onPause($event.detail)" />
`})
```

- Sudoku is zoneless, so the signal updates in the handlers are enough.
- Wortiger still runs zone.js. Template event bindings run inside the zone, so change detection still triggers.
- `CUSTOM_ELEMENTS_SCHEMA` turns off template type checking for these tags. Step 1 below adds typings to compensate.

**SvelteKit (wortgeflecht, spielecp):**

```svelte
<script>
  import { onMount } from 'svelte';
  onMount(() => import('@zeitonline/game-components')); // client-only: customElements doesn't exist during SSR
  let open = $state(false);
</script>

<zon-game-dialog open={open || undefined} variant="wide" onzon-close={() => (open = false)}>
  <zon-game-instructions steps={GAME_INSTRUCTIONS}></zon-game-instructions>
</zon-game-dialog>
```

- Svelte 5 sets a value as a property when the element has one, so `steps` gets the array.
- **Must verify in the pilot:** that `onzon-close` (an event name with a hyphen) binds correctly in runes mode. If it doesn't, fall back to an `{@attach}` / `$effect` with `addEventListener`.

## 4. Trade-offs

### Performance

| Topic | Effect | Mitigation |
|---|---|---|
| **Bundle size** | Very small: 9.9 KB gz for six components, no runtime. Lit would add about 5 KB gz shared. Stencil adds about 3–4 KB of runtime plus a loader. **Angular Elements would put the Angular runtime (~50 KB+) into the Svelte games**, and Svelte `customElement` mode would put the Svelte runtime into the Angular games, so both are ruled out. | Use per-component entry points (`/dialog`, `/timer`) so a game only ships what it uses. |
| **SSR / first paint** | Custom elements are client-only, so Shadow DOM content appears after JS loads and runs. SvelteKit SSR outputs an empty tag. This matters for anything **visible on load** (header, timer): it risks layout shift and a flash. Dialogs and the result screen are not visible on load, so they are unaffected. | Skeletons in `critical.css` (plain HTML + CSS, same sizes as the components) placed inside the tags, or inside `<app-root>` in Angular. Later, use Declarative Shadow DOM for above-the-fold components; the base class already re-uses an existing shadow root. |
| **Rendering model** | Components re-render with `innerHTML` when attributes or properties change. That is fine for low-frequency UI (dialogs, steppers, results) but **wrong for the game board** or anything updating many times per second. | Keep game boards in each framework. The timer only updates the DOM once per second (the Angular version ticked every 100 ms) and uses `performance.now()` for accuracy. |
| **Style cost** | Each shadow root has its own style scope. Constructable stylesheets are shared, so N instances still parse each sheet only once. | – |
| **Caching** | If every game bundles the package, there is no cache sharing across games. A shared URL (e.g. `spiele.zeit.de/components/v1/…`) would be cached across games but couples deploys and needs version pinning. | Start bundled (npm). Revisit the CDN option once more games use the components. |
| **Change detection** | Angular: binding a property to a custom element is cheap. In zone.js apps, every DOM event the component handles internally can trigger app-wide change detection. | Not a concern for sudoku (zoneless). For wortiger, migrate to zoneless or use `OnPush`. |

### Other trade-offs

- **Styling isolation works both ways.**
  - The global `button.scss` / frame styles no longer leak in, which is good for consistency.
  - Customisation is limited to tokens and `::part`, which is a deliberate constraint.
  - **Slotted content is still styled by the host page.** In the demo, the page's `h2 { text-transform: uppercase }` changed the dialog title. Games must style their slotted content themselves.
- **ARIA across the shadow boundary:** `aria-labelledby` / `aria-describedby` cannot reference IDs in a different tree. The components keep those references inside their own shadow root and offer a `label` attribute instead.
- **SEO content (FAQ JSON-LD):** this must stay server-rendered light DOM. `<zon-game-faq>` is therefore a light-DOM element: the server (or static HTML) writes the `<details>`, the component only adds tracking and JSON-LD.
- **Forms:** the paywall plan picker would need form-associated custom elements (`ElementInternals`) if it is ever submitted inside a `<form>`.
- **Typing and DX:** neither framework type-checks unknown elements.
  - Generate a `custom-elements.json` manifest and `.d.ts` files (Angular: `HTMLElementTagNameMap`; Svelte: `svelteHTML.IntrinsicElements`).
  - Consider Lit if the number of components grows past roughly 10; its reactive properties and templates reduce hand-written render code.
- **Testing:** jsdom does not implement `<dialog>.showModal()`, constructable stylesheets or layout. Test in real browsers (Vitest browser mode or Playwright, which sudoku already uses).
- **Versioning blast radius:** about seven games depend on one package. Use semver, a changelog (release-please is already used in spielecp), and allow a breaking change only with a migration note.
- **Token skew:** Wortgeflecht pins design-system 0.5.0, spielecp 0.3.4, and the Angular games read tokens from the frame at runtime. The components rely only on long-standing tokens and ship fallbacks.

## 5. Roadmap

1. **Foundation (this repo):**
   - Move the repo to GitHub, publish to GitHub Packages as `@zeitonline/game-components`, build with esbuild (ESM, per-component exports).
   - Add Vitest browser tests, a custom-elements manifest and typings.
   - Write an ADR in `spielecp/docs/adr`.
2. **Pilot (low risk):**
   - `<zon-game-timer>` + `<zon-game-instructions>` in **sudoku**.
   - `<zon-game-instructions>` in **Wortgeflecht**.
   - Check the Angular zoneless and Svelte 5 event bindings, plus the tracking parity in GTM preview.
3. **Dialog:** replace `OverlayService` / `zonspiele-overlay` and `DialogManager`. This is the most cross-cutting change (paywall, archive, menu all open through it).
4. **Result screen** in sudoku → wortiger (share, fail state through slots/attributes) → Wortgeflecht.
5. **Next candidates:** header shell, "Mehr" menu, USP / login teaser, games carousel / game card (Spiele CP + games), toast / live region.
6. **Roll out** to eckchen, hashi, umdieecke and adventszeit, and delete the copied `commons/` UI.

Out of scope here but worth doing too: a shared non-UI package for `DataTracker` / `TrackingService` and the duplicated framebuilder code.
