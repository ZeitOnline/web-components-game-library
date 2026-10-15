---
summary: "“Weitere Rätsel” block: heading, “Alle anzeigen” and a grid of puzzle rows with status. Every row is a real link."
when:
  - "Below the hero: the last few puzzles."
  - Inside the archive dialog with columns="1".
whenNot:
  - Navigation between different games (that is a game card / carousel).
faq:
  - question: Why is icon a property and not an attribute?
    answer: It is an SVG string. In Svelte set it once the element is defined (see the Frameworks guide); in Angular use `[icon]="icon"`.
a11y:
  - topic: Links
    text: "Each row is an `<a href>`: middle-click, “open in new tab” and crawling work."
  - topic: Status
    text: Started / solved / locked are part of the link text, not only an icon.
  - topic: List
    text: Rows are a real list, so screen readers announce the count.
replaces:
  - sudoku `home/hero/archive-teaser` + `components/teaser`
  - Spiele CP `PuzzleCard` row
---
