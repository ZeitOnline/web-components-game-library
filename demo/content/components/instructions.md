---
summary: "The “So wird gespielt” stepper: slides with text and artwork, progress dots, skip and start. Usually placed inside a wide dialog."
when:
  - First visit of a game, before the first puzzle.
  - From the “Mehr” menu (“Spielregeln”).
whenNot:
  - "Long reference texts: use the FAQ."
faq:
  - question: How do I keep the dialog open after “Rätsel starten”?
    answer: Call `event.preventDefault()` on `zon-complete` (or `zon-skip`).
  - question: Where does the content come from?
    answer: From the game. All three games already share the `GAME_INSTRUCTIONS` shape, so the array can be passed as is.
a11y:
  - topic: Live region
    text: The slide is aria-live="polite" and labelled “Schritt n von m”.
  - topic: Progress
    text: Dots are buttons; the current one has aria-current="step".
  - topic: Focus
    text: Re-rendering keeps keyboard focus on the equivalent control.
  - topic: Artwork
    text: Inline SVG is aria-hidden; images use imageAlt.
replaces:
  - Wortgeflecht `InstructionsDialog.svelte`
  - sudoku `game/instructions`
  - wortiger `components/instructions`
---
