/**
 * <zon-puzzle-list>
 *
 * "Weitere Sudoku Rätsel" block: a heading, an "Alle anzeigen" link and a grid of puzzle
 * rows. Ported from sudoku `home/hero/archive-teaser` and `components/teaser`, which
 * wortiger copies; Spiele CP's `PuzzleCard` row is the same pattern. Each row is a real
 * <a href>, so it works without JS and is crawlable.
 *
 * Attributes
 *   heading      "Weitere Rätsel"
 *   game-name    small supporter line above each date ("Sudoku")
 *   all-label    "Alle anzeigen" (empty string hides the link)
 *   all-href     target of "Alle anzeigen"; without it a button is rendered
 *                (sudoku opens the archive dialog from there)
 *   columns      max columns on wide containers (default 2)
 *   category     logic | word | crossword | mini | quiz (tile colours, default logic)
 *
 * Properties
 *   items  [{ date, href?, label?, status?: 'started' | 'concluded' | 'locked' }]
 *   icon   trusted SVG string for the game icon (36×36), e.g. the game's tile icon
 *
 * CSS hooks
 *   --zon-game-icon-bg, --zon-game-icon-shadow-bg   override the category tile colours
 *
 * Events (bubbles, composed)
 *   zon-puzzle-select { item, index }  cancelable: preventDefault() stops navigation
 *   zon-show-all      { href }         cancelable
 *   zon-track         { event: 'game_interaction', action: 'click', position: 'game_cp' | 'archive' }
 */
import { ZonElement, css, define, escapeHtml, formatGameDate } from '../shared/base.js';
import { icons, statusBadges } from '../shared/icons.js';


export type PuzzleStatus = 'started' | 'concluded' | 'locked';

export interface PuzzleItem {
  /** ISO date, shown as "Dienstag, 6. Okt." unless `label` is set. */
  date: string;
  href?: string;
  label?: string;
  status?: PuzzleStatus;
}

const STATUS_TEXT: Record<PuzzleStatus, string> = {
  concluded: 'Beendet',
  started: 'Weiterspielen',
  locked: 'Kostenlos testen im Probeabo',
};

const sheet = css`
/* 1:1 port of sudoku.zeit.de archive-teaser + teaser (word-length-teaser) styles. */
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
section { display: flex; flex-direction: column; gap: var(--_space-m); }
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--_space-m);
}
.heading { margin: 0; font-size: 20px; font-weight: 700; line-height: 1.2; color: var(--_text-100); }
/* sudoku %textButton */
.all {
  --link-color: var(--_text-70);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: var(--_space-xs);
  margin: 0 calc(-1 * var(--_space-xs));
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--link-color);
  font: inherit;
  font-size: var(--_fs-16);
  font-weight: 400;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 200ms ease-out;
}
.all:hover { background: var(--_bg-10); }

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  row-gap: var(--_space-m);
  column-gap: var(--_space-xl);
}
@container (min-width: 736px) {
  ul {
    grid-template-columns: repeat(var(--_cols, 2), minmax(0, 1fr));
    grid-template-rows: repeat(var(--_rows, 2), 1fr);
    grid-auto-flow: column;
  }
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--_space-m);
  min-width: 0;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}
button.row {
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  text-align: left;
}
.all:focus-visible, .row:focus-visible { outline: 2px solid var(--_focus-100); outline-offset: 4px; border-radius: 4px; }

.main {
  display: flex;
  align-items: center;
  gap: var(--_space-s);
  min-width: 0;
  /* z-index: 0 makes this the stacking context, so the tile shadow (z-index -1)
     sits behind the tile background, as on the live site. */
  position: relative;
  z-index: 0;
}
.tile {
  position: relative;
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--z-ds-border-radius-4, 4px);
  background: var(--zon-game-icon-bg, var(--_game-soft));
  /* Like sudoku: the tile ignores dark mode. */
  --Background-0: #fff;
  --Text-100: #252525;
  --z-ds-color-text-100: #252525;
  color: #252525;
}
.shadow {
  position: absolute;
  z-index: -1;
  width: 46px;
  height: 46px;
  right: -3px;
  top: 5px;
  border-radius: 6px;
  background: var(--zon-game-icon-shadow-bg, var(--_game-bold));
}
.tile svg { display: block; }
.status {
  position: absolute;
  right: 0;
  bottom: 0;
  transform: translate(20%, 20%);
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid var(--_bg-0);
  background: var(--_bg-0);
}
.status svg { width: 18px; height: 18px; }
.text { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.supporter { color: var(--_text-55); font-size: 14px; font-weight: 400; line-height: 1; }
.date { font-size: var(--_fs-16); font-weight: 700; line-height: 1; }
.supporter, .date { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row:hover .date { text-decoration: underline; }
.chevron { flex-shrink: 0; display: flex; color: var(--_text-100); }
`;

export class ZonPuzzleList extends ZonElement {
  static sheet = sheet;
  static observedAttributes = ['heading', 'game-name', 'category', 'all-label', 'all-href', 'columns'];

  #items: PuzzleItem[] = [];
  #icon = '';

  constructor() {
    super();
    this.root.addEventListener('click', (e) => this.#onClick(e));
  }

  connectedCallback(): void {
    this.upgradeProperty('items');
    this.upgradeProperty('icon');
    this.#render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.#render();
  }

  get items(): PuzzleItem[] {
    return this.#items;
  }
  set items(value: PuzzleItem[] | null | undefined) {
    this.#items = Array.isArray(value) ? value : [];
    if (this.isConnected) this.#render();
  }

  /** Trusted SVG string for the game icon (36×36). */
  get icon(): string {
    return this.#icon;
  }
  set icon(svg: string | null | undefined) {
    this.#icon = svg || '';
    if (this.isConnected) this.#render();
  }

  #onClick(e: Event) {
    const target = e.target as Element;
    const all = target.closest('.all');
    if (all) {
      this.track({ event: 'game_interaction', action: 'click', position: 'archive', target: 'show_all' });
      if (!this.emit('zon-show-all', { href: this.getAttribute('all-href') }, { cancelable: true })) e.preventDefault();
      return;
    }
    const row = target.closest<HTMLElement>('.row');
    if (!row) return;
    const index = Number(row.dataset.index);
    const item: PuzzleItem | undefined = this.#items[index];
    this.track({ event: 'game_interaction', action: 'click', position: 'game_cp', target: item?.date });
    if (!this.emit('zon-puzzle-select', { item, index }, { cancelable: true })) e.preventDefault();
  }

  #render() {
    const items = this.#items;
    const cols = Math.max(1, Number(this.getAttribute('columns')) || 2);
    const rows = Math.ceil(items.length / cols) || 1;
    const gameName = this.getAttribute('game-name');
    const allHref = this.getAttribute('all-href');
    const allLabel = escapeHtml(this.label('all-label', 'Alle anzeigen'));
    const heading = escapeHtml(this.label('heading', 'Weitere Rätsel'));
    const allInner = `<span>${allLabel}</span>${icons.chevronRight(14)}`;
    const all = !allLabel
      ? ''
      : allHref
      ? `<a class="all" part="all" href="${escapeHtml(allHref)}" aria-label="${allLabel}: ${heading}">${allInner}</a>`
      : `<button type="button" class="all" part="all" aria-haspopup="dialog" aria-label="${allLabel}: ${heading}">${allInner}</button>`;

    const rowsHtml = items
      .map((item, i) => {
        const title = escapeHtml(item.label ?? formatGameDate(item.date));
        const status = item.status ? STATUS_TEXT[item.status] : undefined;
        const badge = item.status ? statusBadges[item.status] : undefined;
        const tag = item.href ? 'a' : 'button';
        const attrs = item.href ? `href="${escapeHtml(item.href)}"` : 'type="button"';
        return `<li>
          <${tag} class="row" part="row" data-index="${i}" ${attrs}>
            <span class="main"><span class="tile"><span class="shadow"></span>${this.#icon}${badge ? `<span class="status">${badge}</span>` : ''}</span>
            <span class="text">
              ${gameName ? `<span class="supporter">${escapeHtml(gameName)}</span>` : ''}
              <span class="date">${title}</span>
              ${status ? `<span class="supporter">${status}</span>` : ''}
            </span></span>
            <span class="chevron">${icons.chevronRight(18)}</span>
          </${tag}>
        </li>`;
      })
      .join('');

    this.root.innerHTML = `
      <section aria-labelledby="heading" part="section">
        <div class="head">
          <h2 class="heading" id="heading" part="heading">${heading}</h2>
          ${all}
        </div>
        <ul style="--_cols: ${cols}; --_rows: ${rows}">${rowsHtml}</ul>
      </section>`;
  }
}

define('zon-puzzle-list', ZonPuzzleList);

declare global {
  interface HTMLElementTagNameMap {
    'zon-puzzle-list': ZonPuzzleList;
  }
}
