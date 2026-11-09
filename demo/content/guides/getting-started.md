---
title: Getting started
summary: "What is in the package, how to install it in a game and how to run this site."
order: 1
---

Framework-agnostic web components for the UI that ZEIT ONLINE games share, used by both the Angular games (sudoku, wortiger, …) and the SvelteKit games (Wortgeflecht, Spiele CP). Written in TypeScript, no runtime dependencies, themed through the `--z-ds-*` design tokens.

## The components

| Element | Purpose |
| --- | --- |
| `<zon-game-hero>` | Landing-page start banner (badge, game name, date, CTA, illustration) |
| `<zon-puzzle-list>` | "Weitere … Rätsel" grid with status badges and "Alle anzeigen" |
| `<zon-game-faq>` | FAQ accordion in the light DOM (SEO), native `<details>`, tracking, JSON-LD |
| `<zon-game-feedback-button>` | Yellow “Feedback zum …” button that opens a Typeform survey |
| `<zon-game-navigation>` | In-game header: back / archive / title / theme or hint / more, plus custom buttons |
| `<zon-game-timer>` | Stopwatch with pause |
| `<zon-game-result>` | End-of-game screen with stats, share and next / replay |
| `<zon-game-button>` | The shared button: primary, secondary, outline, text, premium, icon |
| `<zon-game-dialog>` | Modal / bottom sheet / fullscreen (paywall) on native `<dialog>` |
| `<zon-game-instructions>` | "So wird gespielt" stepper |
| `critical.css` | Skeletons for hero / list / FAQ and the FAQ styles, loaded in `<head>` |

## Install

The source is TypeScript; the package ships the compiled ES modules and types from `dist/`, which its `prepare` script builds on install. Until it is published, pack it (that runs the build) and install the tarball in the game.

```sh
cd <path-to-library>
npm pack
# → zeitonline-game-components-<version>.tgz

cd <path-to-game>
npm install <path-to-library>/zeitonline-game-components-<version>.tgz
```

`<path-to-game>` is the folder of the game's frontend `package.json`, e.g. the repo root for Wortgeflecht or `packages/frontend` for Sudoku.

## Import

Import single components to load only what the game uses, or everything at once:

```js
import '@zeitonline/game-components/hero';
import '@zeitonline/game-components/puzzle-list';
// or
import '@zeitonline/game-components';
```

Entry points: `/button`, `/dialog`, `/hero`, `/navigation`, `/puzzle-list`, `/faq`, `/feedback-button`, `/timer`, `/result`, `/instructions`, `/tracking`. Type declarations are included. How to import in SvelteKit and Angular: see [Frameworks](./frameworks.md).

Also load `critical.css` render-blocking in `<head>` (skeletons and FAQ styles):

```jsonc
// Angular: angular.json → build options
"styles": ["node_modules/@zeitonline/game-components/src/critical.css", "src/styles.scss"]
```

```svelte
<!-- SvelteKit: root +layout.svelte -->
<script>import '@zeitonline/game-components/critical.css';</script>
```

## After changing the library

Pack and install again: the tarball's hash changes on every pack. Then restart the dev server; for Vite use `--force` so it drops its cached copy (`npx vite dev --force`).

- **Never commit the `file:` dependency.** Revert `package.json` and `package-lock.json` before pushing: CI can't resolve a path on your machine.
- **Port clashes:** this docs site runs on 5173. Start the game with `--port <port>` if it uses the same one.

## Run this site

```sh
npm install --prefix demo   # once
npm run dev                 # http://localhost:5173
```

The site is a SvelteKit app in `demo/` that depends on the package via `file:..`, exactly like a game would. Edits in `src/` reload the page.

## Edit the content

Guides and the written parts of each component page (summary, usage, FAQ, accessibility, “Replaces”) are Markdown files in `demo/content/`. Edit them in any editor, or in Sveltia CMS:

1. `npm run dev` and open [/admin/index.html](/admin/index.html) in **Chrome or Edge**.
2. Choose **Work with Local Repository** and select the repository **root** folder.
3. Edit and save. Sveltia writes the files on disk and the docs page reloads. Nothing is committed or pushed: review the diff and commit as usual.

“Edit content” on each component page and “Edit this guide” on each guide open the matching entry. The API tables, playground and tracking stay in code (`demo/src/lib/components/<slug>.js`), so they can't drift from the components. New components start in code too.

