---
summary: "“Häufig gestellte Fragen” accordion in the light DOM with native `<details>`: crawlable, works without JavaScript, adds tracking and optional JSON-LD."
when:
  - Bottom of every game landing page (SEO).
whenNot:
  - "Rules of the game itself: use the instructions stepper."
faq:
  - question: Markup or items?
    answer: "Markup for static and server-rendered pages: the questions are in the HTML. `items` for client-rendered apps."
  - question: Why light DOM?
    answer: Search engines and find-in-page see the text, and it works before the script loads.
a11y:
  - topic: Native
    text: "`<details>`/`<summary>`: keyboard, screen readers and find-in-page work without script."
  - topic: Headings
    text: Each question is a heading inside the summary, so the FAQ shows up in the page outline.
  - topic: Styles
    text: Come from critical.css; the component warns in the console when they are missing.
replaces:
  - sudoku / wortiger static `.faq` block
  - Wortgeflecht `FAQSection` + `FAQStructureData`
---
