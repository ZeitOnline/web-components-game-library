/**
 * <zon-game-hero>
 *
 * The big start banner at the top of a game's landing page. Ported from sudoku
 * `home/hero/start-teaser`, which wortiger copies.
 *
 * The layout follows the space the component gets (container queries), not the
 * viewport. That makes it work the same in a full-width Angular page, a narrow
 * SvelteKit column or a Spiele CP grid cell:
 *   narrow  image on top (5:2), badge overlapping its bottom edge
 *   wide    two halves, text left, square image right
 *
 * Attributes
 *   game-name        "Sudoku"
 *   date             ISO date of the puzzle, shown as "Dienstag, 6. Okt."
 *   state            new | continue | unplayed | solved   (default new)
 *   href             if set, the CTA is a real link (works without JS, good for SEO)
 *   cta-label        overrides "Erstes Rätsel starten" / "Rätsel lösen"
 *   badge-label      overrides "Neu" / "Weiterspielen" / "Ungelöst" / "Gelöst"
 *   magazine-label   optional pill in the image corner, e.g. "+ ZEIT Magazin Rätsel"
 *   heading-level    2 (default) – the game name heading level
 *
 *   category         logic | word | crossword | mini | quiz – picks the frame's
 *                    --z-ds-color-games-<category>-* colours (default logic)
 *
 * Slots
 *   image     game illustration (svg/img)
 *
 * CSS hooks
 *   --zon-game-color            overrides the image background (default: category base colour)
 *   --zon-hero-art-width        illustration width, narrow layout (default 50%, as live)
 *   --zon-hero-art-width-wide   illustration width, wide layout (default 80%, as live)
 *
 * Events (bubbles, composed)
 *   zon-start { date, state, href }  cancelable: preventDefault() keeps the
 *                                    link from navigating (SPA routing, dialogs)
 *   zon-track { event: 'game_interaction', action: 'click', position: 'header_teaser' }
 */
import { ZonElement, css, define, escapeHtml, formatGameDate } from '../shared/base.js';

const BADGES = { new: 'Neu', continue: 'Weiterspielen', unplayed: 'Ungelöst', solved: 'Gelöst' };


const sheet = css`
/* 1:1 port of sudoku.zeit.de start-teaser (teaser-card) styles. */
/*
 * container-type: inline-size removes the element's intrinsic width. Inside a
 * shrink-to-fit parent (e.g. a flex column with align-items: center, as in
 * Wortgeflecht's layout) it would collapse to 0px, so always fill the line.
 */
:host {
  display: block;
  width: 100%;
  box-sizing: border-box;
  container-type: inline-size;
}
.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  overflow: hidden;
  border-radius: var(--_radius-8);
  background: var(--zon-hero-bg, var(--_bg-0));
  box-shadow: 0 0 8px #464e5114, 0 6px 24px #464e511f;
  outline: 1px solid var(--zon-hero-border, transparent);
}
.image {
  position: relative;
  width: 100%;
  aspect-ratio: 5 / 2;
  padding-top: 40px;
  background: var(--zon-game-color, var(--_game-base));
}
/* Like the live <img>: absolutely centred, 50% wide (80% on wide layouts). */
.art {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--zon-hero-art-width, 50%);
  max-height: 100%;
  translate: -50% -50%;
  display: grid;
  place-items: center;
}
.art ::slotted(*) { display: block; width: 100%; height: auto; max-height: 100%; }
.magazine {
  position: absolute;
  z-index: 1;
  top: var(--_space-s);
  right: var(--_space-s);
  display: flex;
  align-items: center;
  padding: 6px var(--_space-xs);
  border: 1px solid var(--_border-70);
  border-radius: 4px;
  background: var(--_bg-0);
  color: var(--_text-70);
  font-size: 14px;
  line-height: 1;
}
.content {
  position: relative;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  align-items: center;
  gap: var(--_space-m);
  padding: var(--_space-l);
  margin-top: calc(-1 * (var(--_space-l) + 15px));
  text-align: center;
}
.badge {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  margin-bottom: 4px;
  padding: 0 var(--_space-s);
  border-radius: 15px;
  background: var(--_games-yellow);
  box-shadow: 0 4px 12px #ffc9253d;
  color: #000;
  font-size: var(--_fs-14);
  font-weight: 700;
  line-height: 1;
}
.text {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  gap: 6px;
  margin-top: calc(var(--_space-l) - 15px - var(--_space-m));
  font-size: var(--_fs-16);
  line-height: 1.5;
}
.title {
  margin: 0;
  font-size: var(--z-ds-fontsize-32, 32px);
  font-weight: 700;
  line-height: 1.2;
}
/* sudoku %buttonPrimary (dsButton) */
.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--_space-xs);
  height: 40px;
  min-width: 80px;
  padding: 0 var(--_space-m);
  border: none;
  border-radius: var(--z-ds-border-radius-4, 4px);
  background: var(--_text-100);
  color: var(--_bg-0);
  font: inherit;
  font-size: var(--_fs-16);
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
}
.cta:hover { background: var(--_text-70); }
.cta:focus-visible { outline: 2px solid var(--_focus-100); outline-offset: 4px; }

/* Live breakpoint is 768px viewport; here it is the component's own width. */
@container (min-width: 736px) {
  .card { flex-direction: row-reverse; }
  .image { aspect-ratio: 1; width: auto; height: 100%; flex: 0 0 50%; }
  .art { width: var(--zon-hero-art-width-wide, 80%); }
  .content { margin-top: 0; justify-content: center; }
  .badge { margin-bottom: -4px; }
  .text { gap: var(--_space-xs); margin-top: 0; }
  .title { font-size: var(--z-ds-fontsize-34, 34px); }
}
`;

export class ZonGameHero extends ZonElement {
  static sheet = sheet;
  static observedAttributes = [
    'game-name', 'category', 'date', 'state', 'href', 'cta-label', 'badge-label', 'magazine-label', 'heading-level',
  ];

  constructor() {
    super();
    this.root.addEventListener('click', (e) => {
      const cta = e.target.closest('.cta');
      if (!cta) return;
      const state = this.#state;
      this.track({ event: 'game_interaction', action: 'click', position: 'header_teaser', target: state });
      const proceed = this.emit(
        'zon-start',
        { date: this.getAttribute('date'), state, href: this.getAttribute('href') },
        { cancelable: true },
      );
      if (!proceed) e.preventDefault();
    });
  }

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  get #state() {
    const s = this.getAttribute('state');
    return s in BADGES ? s : 'new';
  }

  #render() {
    const state = this.#state;
    const name = this.label('game-name', 'Sudoku');
    const href = this.getAttribute('href');
    const level = Math.min(6, Math.max(1, Number(this.getAttribute('heading-level')) || 2));
    const cta = this.label('cta-label', state === 'new' ? 'Erstes Rätsel starten' : 'Rätsel lösen');
    const magazine = this.getAttribute('magazine-label');
    const ctaHtml = href
      ? `<a class="cta" part="cta" href="${escapeHtml(href)}">${escapeHtml(cta)}</a>`
      : `<button type="button" class="cta" part="cta">${escapeHtml(cta)}</button>`;

    this.root.innerHTML = `
      <article class="card" part="card">
        <div class="image" part="image">
          ${magazine ? `<span class="magazine">${escapeHtml(magazine)}</span>` : ''}
          <div class="art"><slot name="image"></slot></div>
        </div>
        <div class="content" part="content">
          <span class="badge" part="badge">${escapeHtml(this.label('badge-label', BADGES[state]))}</span>
          <div class="text">
            <h${level} class="title" part="title">${escapeHtml(name)}</h${level}>
            <span class="date">${escapeHtml(formatGameDate(this.getAttribute('date')))}</span>
          </div>
          ${ctaHtml}
        </div>
      </article>`;
  }
}

define('zon-game-hero', ZonGameHero);
