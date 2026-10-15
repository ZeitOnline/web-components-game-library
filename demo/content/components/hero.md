---
summary: "Start banner of a game’s landing page: badge, game name, date, CTA and illustration. Its layout follows the container (container queries), not the viewport."
when:
  - Top of a game’s landing page, for today’s puzzle.
whenNot:
  - "Lists of older puzzles: use the puzzle list."
faq:
  - question: Why does the layout not change at my breakpoint?
    answer: It reacts to the width of its container (wide from 736px). In a narrow column it stays narrow even on desktop. Try the container width switch in the playground.
  - question: How do I avoid a jump on load?
    answer: Put the hero skeleton from `critical.css` inside the tag. See the Skeletons guide.
a11y:
  - topic: Heading
    text: The game name is a real heading; set heading-level to fit the page outline (1 on landing pages).
  - topic: CTA
    text: A real `<a href>` when href is set, otherwise a `<button>`.
  - topic: Artwork
    text: Decorative images need alt=""; meaningful SVGs role="img" and a label.
replaces:
  - sudoku `home/hero/start-teaser` (copied by wortiger)
  - Wortgeflecht landing banner
---
