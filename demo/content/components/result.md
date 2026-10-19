---
summary: "End-of-game screen: icon, heading, summary, stats, share and next / replay. Game-specific widgets are slotted in."
when:
  - After a puzzle is solved or failed.
whenNot:
  - Intermediate progress inside the game.
faq:
  - question: How do I show a fail state?
    answer: Set `heading`, swap the icon via `slot="icon"` and put the solution list into the default slot.
  - question: Why does stats have to be a property?
    answer: 'It is structured data. Angular: `[stats]="stats"`, Svelte: `stats={stats}`.'
a11y:
  - topic: Landmark
    text: A `<section>` labelled by its heading.
  - topic: Stats
    text: "A description list: label (dt) and value (dd)."
  - topic: Status
    text: “Kopiert” is announced through a polite live region.
replaces:
  - sudoku / wortiger `closure-screen-metered` + `statistic`
  - Wortgeflecht `GameEndScreen.svelte`
---
