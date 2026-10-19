---
summary: "The yellow “Feedback zum Sudoku” button that opens a Typeform survey. A real link to the form, so it works without JavaScript; the Typeform SDK loads only when someone is about to click."
when:
  - "Below the FAQ on a game’s landing page, as in sudoku, wortiger, eckchen, hashi and umdieecke."
  - On end screens of limited campaigns that ask for feedback (adventszeit).
whenNot:
  - "Inside the game board area: it would compete with the game’s own actions."
  - "Several surveys on one page: use one button per form."
faq:
  - question: Where do I find the form id?
    answer: "In the Typeform share link: `form.typeform.com/to/obbQ8AeR` → `obbQ8AeR`. The games used it as `data-tf-popup`."
  - question: Do I still need the Typeform embed script on the page?
    answer: "No. The component loads it on hover, focus or click. If the page already has it (sudoku's `assets/scripts/embed.js`), it is reused. Set `embed-src` to load a self-hosted copy."
  - question: How much space goes above it?
    answer: "The games use **52px** above the button. Spacing belongs to the page layout, so the component sets none."
  - question: Does it move the page when it loads?
    answer: "No. `critical.css` reserves the 50px height before the script runs. Add the `zon-skeleton--feedback-button` placeholder inside the tag to also show a yellow pill (see [Skeletons](./skeletons.md))."
  - question: What happens if Typeform is blocked?
    answer: The form opens in a new tab instead. Without JavaScript the link does the same.
a11y:
  - topic: Role
    text: "A link (`<a href>`) to the form, with aria-haspopup=\"dialog\" for the popup."
  - topic: Focus
    text: "2px outline in focus-100, as in sudoku's `.typeform-survey-wrapper`."
  - topic: Popup
    text: Typeform's own dialog; Esc and the close button close it.
  - topic: Print
    text: Hidden when printing.
replaces:
  - "sudoku / wortiger / eckchen / hashi / umdieecke `.typeform-survey-wrapper` (inline-styled `<button data-tf-popup>` in index*.html)"
  - "sudoku `assets/scripts/embed.js` loaded on every page (angular.json)"
  - "adventszeit `ArchiveImageEndScreen.svelte` typeform button"
---
