---
title: Theming
summary: "Tokens, dark mode, game colours and what can be styled from outside."
order: 5
---

## Tokens

Custom properties inherit through the shadow boundary, so every component reads the ZON design tokens (`--z-ds-*`) that the frame / `@zeitonline/design-system` put on `:root`. The fallbacks mirror sudoku's `root-vars.scss`, so the components still look right on a page without the frame.

Fonts are inherited from the page as well; the components never declare a `font-family`.

## Dark mode

The components have no dark mode of their own: they follow the tokens. The ZON frame switches them with `html.color-scheme-dark` / `html.color-scheme-light` and a `colorscheme` event on `window`. `<zon-game-navigation>`'s theme button uses the same convention, and so does this site: the button in the header and the one in the navigation playground change the same thing.

Each playground can also pin its stage to **Light** or **Dark** by redefining the tokens on the stage only.

## Game colours

The `category` attribute (`logic`, `word`, `crossword`, `mini`, `quiz`) picks the frame tokens `--z-ds-color-games-<category>-base/soft/bold`. Game artwork comes in through slots or properties; it is never built into the components.

## Styling from outside

Shadow DOM keeps the page's CSS out, which is the point: global `button` or frame styles no longer leak in. What is open:

- **Tokens** and documented **CSS custom properties** (`--zon-dialog-max-width`, `--zon-hero-art-width`, …), listed on each component page.
- **Shadow parts**: `zon-game-hero::part(cta) { … }`. Each component page's *Anatomy* shows the parts on the real rendering.
- **Slotted content** is light DOM, so the page styles it. A global `h2 { text-transform: uppercase }` also hits `<h2 slot="title">`.
