/**
 * Shared base styles.
 *
 * Custom properties inherit through the shadow boundary, so every component reads
 * the ZON design tokens (`--z-ds-*`) that the framebuilder / @zeitonline/design-system
 * put on :root. The fallbacks mirror sudoku's `commons/styles/root-vars.scss`, so
 * the components still look right on a page without the frame (demo, Storybook).
 *
 * Fonts are inherited from the frame as well; we never declare a font-family.
 */
const sheet = new CSSStyleSheet();
sheet.replaceSync(`
:host {
  --_text-100: var(--z-ds-color-text-100, #252525);
  --_text-70: var(--z-ds-color-text-70, #444);
  --_text-55: var(--z-ds-color-text-55, #69696c);
  --_bg-0: var(--z-ds-color-background-0, #fff);
  --_bg-10: var(--z-ds-color-background-10, #eee);
  --_bg-20: var(--z-ds-color-background-20, #dfdfe1);
  --_bg-modal: var(--z-ds-color-background-modal, #fff);
  --_border-70: var(--z-ds-color-border-70, #e4e4e4);
  --_border-100: var(--z-ds-color-border-100, #cccccf);
  --_black-100: var(--z-ds-color-general-black-100, #000);
  --_black-40: var(--z-ds-color-general-black-40, rgba(0, 0, 0, 0.4));
  --_white-100: var(--z-ds-color-general-white-100, #fff);
  --_accent-100: var(--z-ds-color-accent-100, #b91109);
  --_accent-70: var(--z-ds-color-accent-70, #880d07);
  --_focus-100: var(--z-ds-color-focus-100, #005fcc);
  --_games-accent: var(--games-accent, #ffcd29);

  --_space-xs: var(--z-ds-space-xs, 8px);
  --_space-s: var(--z-ds-space-s, 12px);
  --_space-m: var(--z-ds-space-m, 16px);
  --_space-l: var(--z-ds-space-l, 24px);
  --_space-xl: var(--z-ds-space-xl, 32px);

  --_radius-4: var(--z-ds-border-radius-4, 4px);
  --_radius-8: var(--z-ds-border-radius-8, 8px);
  --_radius-12: var(--z-ds-border-radius-12, 12px);
  --_shadow: var(--z-ds-boxshadow-base, 0 4px 16px rgba(0, 0, 0, 0.16));

  --_fs-14: var(--z-ds-fontsize-14, 14px);
  --_fs-16: var(--z-ds-fontsize-16, 16px);
  --_fs-20: var(--z-ds-fontsize-20, 20px);
  --_fs-24: var(--z-ds-fontsize-24, 24px);

  color: var(--_text-100);
  font: inherit;
  box-sizing: border-box;
}
/*
 * Game category colours. These are the frame tokens (custom-properties.css) that sudoku.zeit.de
 * uses as --Game-Category-*. The fallbacks are the exact live values. Default is "logic" (Sudoku).
 *   base = hero image background, soft = icon tile, bold = icon tile shadow
 */
:host, :host([category='logic']) {
  --_game-base: var(--z-ds-color-games-logic-base, #fccdb6);
  --_game-soft: var(--z-ds-color-games-logic-soft, #fae4d3);
  --_game-bold: var(--z-ds-color-games-logic-bold, #e1b29b);
}
:host([category='word']) {
  --_game-base: var(--z-ds-color-games-word-base, #d6d5f4);
  --_game-soft: var(--z-ds-color-games-word-soft, #e6e7f7);
  --_game-bold: var(--z-ds-color-games-word-bold, #bbb9e6);
}
:host([category='crossword']) {
  --_game-base: var(--z-ds-color-games-crossword-base, #bbdef7);
  --_game-soft: var(--z-ds-color-games-crossword-soft, #d9ecf9);
  --_game-bold: var(--z-ds-color-games-crossword-bold, #98c0dc);
}
:host([category='mini']) {
  --_game-base: var(--z-ds-color-games-mini-base, #d5e6be);
  --_game-soft: var(--z-ds-color-games-mini-soft, #e6efde);
  --_game-bold: var(--z-ds-color-games-mini-bold, #bcc9b0);
}
:host([category='quiz']) {
  --_game-base: var(--z-ds-color-games-quiz-base, #b3dddd);
  --_game-soft: var(--z-ds-color-games-quiz-soft, #d7eeed);
  --_game-bold: var(--z-ds-color-games-quiz-bold, #93c8c8);
}
:host { --_games-yellow: var(--z-ds-color-games-yellow-base, #ffc925); }

:host([hidden]), [hidden] { display: none !important; }
*, *::before, *::after { box-sizing: inherit; }

/*
 * Buttons: the styles sudoku (commons/styles/button.scss) and Wortgeflecht (lib/styles/button.css)
 * share. Used by <zon-game-button> and by the buttons inside the other components, so every
 * button in the library looks the same. Colours are tokens, so dark mode comes for free.
 *   primary (default) · --secondary · --outline · --text · --premium · --icon (round) · --small
 */
.zon-button {
  appearance: none;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--_space-xs);
  height: 40px;
  min-width: 80px;
  padding: 0 var(--_space-m);
  border: 0;
  border-radius: var(--_radius-4);
  background: var(--_text-100);
  color: var(--_bg-0);
  font: inherit;
  font-size: var(--_fs-16);
  font-weight: 700;
  line-height: 1;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 200ms ease-out, color 200ms ease-out;
}
.zon-button:hover { background: var(--_text-70); }
.zon-button--secondary { background: var(--_bg-10); color: var(--_text-100); }
.zon-button--secondary:hover { background: var(--_bg-20); }
.zon-button--outline { background: var(--_bg-0); color: var(--_text-100); box-shadow: inset 0 0 0 1px var(--_border-70); }
.zon-button--outline:hover { background: var(--_bg-10); }
/* Z+ / paywall. White text on both themes. */
.zon-button--premium { background: var(--_accent-100); color: #fff; }
.zon-button--premium:hover { background: var(--_accent-70); }
.zon-button--text {
  height: auto;
  min-width: 0;
  padding: var(--_space-xs);
  margin: 0 calc(-1 * var(--_space-xs));
  background: transparent;
  color: var(--_text-70);
  font-weight: 400;
}
.zon-button--text:hover { background: var(--_bg-10); color: var(--_text-100); }
.zon-button svg { display: block; flex-shrink: 0; }
/* Round icon button, as in the game navigation (sudoku iconButton): 43px, 32px when small. */
.zon-button--icon {
  flex: none;
  width: 43px;
  min-width: 0;
  height: 43px;
  padding: 0;
  border: 1px solid var(--_border-100);
  border-radius: 50%;
  background: var(--_bg-0);
  color: var(--_text-70);
}
.zon-button--icon:hover { background: var(--_border-100); }
.zon-button--small { height: 32px; font-size: var(--_fs-14); }
.zon-button--icon.zon-button--small { width: 32px; height: 32px; }
.zon-button:focus-visible {
  outline: 2px solid var(--_focus-100);
  outline-offset: 4px;
}
.zon-button:is(:disabled, [aria-disabled='true']) { opacity: 0.4; cursor: default; pointer-events: none; }

.sr-only {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }
}
`);

export const baseSheet: CSSStyleSheet = sheet;
