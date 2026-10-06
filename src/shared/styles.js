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
  --_bg-modal: var(--z-ds-color-background-modal, #fff);
  --_border-70: var(--z-ds-color-border-70, #e4e4e4);
  --_black-100: var(--z-ds-color-general-black-100, #000);
  --_black-40: var(--z-ds-color-general-black-40, rgba(0, 0, 0, 0.4));
  --_white-100: var(--z-ds-color-general-white-100, #fff);
  --_accent-100: var(--z-ds-color-accent-100, #b91109);
  --_focus-100: var(--z-ds-color-focus-100, #005fcc);
  --_games-accent: var(--games-accent, #ffcd29);

  --_space-xs: var(--z-ds-space-xs, 8px);
  --_space-s: var(--z-ds-space-s, 12px);
  --_space-m: var(--z-ds-space-m, 16px);
  --_space-l: var(--z-ds-space-l, 24px);
  --_space-xl: var(--z-ds-space-xl, 32px);

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

.zon-button {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--_space-xs);
  min-height: 44px;
  padding: var(--_space-s) var(--_space-m);
  border: 0;
  border-radius: var(--_radius-8);
  font: inherit;
  font-weight: 700;
  font-size: var(--_fs-16);
  cursor: pointer;
  background: var(--_black-100);
  color: var(--_white-100);
}
.zon-button--secondary {
  background: transparent;
  color: var(--_text-100);
  box-shadow: inset 0 0 0 1px var(--_border-70);
}
.zon-button--text {
  background: transparent;
  color: var(--_text-100);
  text-decoration: underline;
  font-weight: 400;
}
.zon-button--icon {
  min-height: 0;
  padding: var(--_space-xs);
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--_bg-0);
  color: var(--_text-100);
  box-shadow: inset 0 0 0 1px var(--_border-70);
}
.zon-button:focus-visible {
  outline: 2px solid var(--_focus-100);
  outline-offset: 4px;
}
.zon-button[disabled] { opacity: 0.4; cursor: default; }

.sr-only {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }
}
`);

export const baseSheet = sheet;
