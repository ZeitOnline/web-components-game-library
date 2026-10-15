---
summary: "The button the games share: primary, secondary, outline, text, premium (Z+) and round icon buttons, as a real `<button>` or, with `href`, a link. The buttons inside the other components use the same styles."
when:
  - "Actions in content you put into the components, e.g. the footer of a `<zon-game-dialog>`."
  - "**Primary** for the main action of a view, **secondary** or **outline** next to it, **text** for minor actions."
  - "**Premium** for Z+ / paywall actions."
whenNot:
  - "Navigation inside running text: use a normal link."
  - "Several primary buttons next to each other."
faq:
  - question: Button or link?
    answer: "Set `href` when it goes somewhere (it renders an `<a>`, so middle-click and crawling work). Leave it out when it does something."
  - question: How do I make it full width?
    answer: "It fills its element. In a column flex container (like the dialog footer) it stretches by itself; elsewhere give it `width: 100%` or `display: flex`."
  - question: Can I put it in a form?
    answer: "Yes. `type=\"submit\"` submits the surrounding `<form>`, `type=\"reset\"` resets it."
  - question: How do I make a round button like in the game navigation?
    answer: "`<zon-game-button variant=\"icon\" icon=\"archive\">Archiv öffnen</zon-game-button>`: 43px, or 32px with `size=\"small\"`. Ready-made icons: back, archive, more, hint, sun, moon, close, play, pause, share, print. The navigation uses the same style and icons."
  - question: Why does it look different from Wortgeflecht's button?
    answer: "The default follows sudoku (40px, 16px). `size=\"small\"` is Wortgeflecht's 14px button."
a11y:
  - topic: Role
    text: "A native `<button>` (or `<a href>`): keyboard and screen readers work without extra ARIA."
  - topic: Focus
    text: "`focus()` on the element focuses the inner button (delegatesFocus). 2px outline in focus-100."
  - topic: Icon buttons
    text: "With `icon`, the text inside is the accessible name (visually hidden). With a custom svg and no text, set `label`."
  - topic: Disabled
    text: "A disabled link gets aria-disabled and no href."
replaces:
  - "sudoku `commons/styles/button.scss` (button, dsButton, buttonPrimary / Secondary / Premium, dsTextButton, iconButton)"
  - "Wortgeflecht `Button.svelte` + `lib/styles/button.css`"
  - "the internal `.zon-button` styles of this library (now shared with this element)"
---
