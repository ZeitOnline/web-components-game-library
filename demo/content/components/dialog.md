---
summary: "Modal, bottom sheet or fullscreen overlay on the native `<dialog>` element: top layer, inert background and focus trap come for free."
when:
  - "Rules, archive, “Mehr” menu and the paywall: anything that interrupts the game."
  - "`drawer` for menus and lists on mobile, `wide` for the rules stepper."
whenNot:
  - Short confirmations that do not need focus (use a toast / live region).
  - Navigation to a different page.
faq:
  - question: Why does my slotted heading look different?
    answer: 'Slotted content is light DOM: the page styles it. A global `h2 { text-transform: uppercase }` also hits `<h2 slot="title">`. Style slotted content in the game.'
  - question: How do I open it from `<zon-game-navigation>`?
    answer: Give the dialog an id and set `archive-dialog="<id>"` or `more-dialog="<id>"` on the navigation. aria-expanded is kept in sync automatically.
  - question: Can I stack dialogs?
    answer: Yes. Each one is a top-layer element; the scroll lock counts open dialogs.
a11y:
  - topic: Role
    text: "Native modal `<dialog>`: the rest of the page is inert while it is open."
  - topic: Name
    text: aria-labelledby points at the title slot; without a title, set label.
  - topic: Focus
    text: Moves to the title on open (screen readers announce it) and back to the opener on close.
  - topic: Keyboard
    text: Esc closes, unless persistent. Tab stays inside the dialog.
  - topic: Scroll
    text: The page behind is scroll-locked; nested dialogs are counted.
replaces:
  - Wortgeflecht `Dialog.svelte` + `DialogManager`
  - Angular `zonspiele-overlay` + `OverlayService` (CDK focus trap)
---
