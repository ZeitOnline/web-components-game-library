---
summary: "In-game header: round icon buttons left and right, centred title. Built-in actions (back, archive, theme, hint, more) plus custom buttons with callbacks."
when:
  - Top of the game screen.
whenNot:
  - "Landing pages: the ZON frame provides that header."
faq:
  - question: Handlers, events or customActions?
    answer: 'Svelte / vanilla: `handlers`. Angular: `(zon-nav)="…"`. Game-specific buttons (print): `customActions`.'
  - question: The theme button changed this whole site. Why?
    answer: Its default action toggles `html.color-scheme-dark`, the ZON frame convention, and fires `colorscheme` on window. This site uses the same convention.
a11y:
  - topic: Names
    text: Every icon button has a German aria-label; override with `<action>-label`.
  - topic: Theme
    text: role="switch" with aria-checked, synced with the frame’s colour scheme.
  - topic: Menus
    text: archive and more have aria-haspopup="dialog" and aria-expanded.
  - topic: Disabled
    text: aria-disabled keeps disabled buttons discoverable.
replaces:
  - sudoku `game/game-header` + `darkmode-toggle` (copied by wortiger)
  - Wortgeflecht `GameHeader.svelte`
---
