/**
 * <zon-game-result>
 *
 * End-of-game screen shell. Its copies are sudoku/wortiger `closure-screen-metered` with the
 * `statistic` widget, and Wortgeflecht `GameEndScreen.svelte`. Game-specific parts (the solution
 * list, highscore, voucher, teasers) stay in the game and are slotted in.
 *
 * Attributes
 *   heading           "Gut gemacht!"
 *   primary-label     "Zum nächsten Rätsel"   (hidden if empty string)
 *   secondary-label   "Erneut spielen"        (hidden if empty string)
 *   share-text        enables the share button; text passed to navigator.share / clipboard
 *   share-url         optional URL for navigator.share
 *   share-label       "Ergebnis teilen"
 *   copied-label      "In die Zwischenablage kopiert"
 *
 * Properties
 *   stats   [{ label, value, record?: boolean, badge?: string }]
 *
 * Slots
 *   icon      replaces the party icon tile
 *   summary   e.g. "In <strong>04:12</strong> gelöst – schneller als 80 %"
 *   (default) extra sections (widgets, teasers, solution list)
 *
 * Events (bubbles, composed)
 *   zon-primary, zon-secondary
 *   zon-share  { method: 'native' | 'clipboard' | 'cancelled' | 'failed' }
 *   zon-track  { event: 'game_interaction', action: 'click', target: 'next'|'replay'|'share' }
 */
import { ZonElement, css, define, escapeHtml } from '../shared/base.js';
import { icons } from '../shared/icons.js';

export interface ResultStat {
  label: string;
  value: string | number;
  record?: boolean;
  badge?: string;
}

/** `method` of the zon-share event. */
export type ShareMethod = 'native' | 'clipboard' | 'cancelled' | 'failed';

type ResultAction = 'primary' | 'secondary' | 'share';
const TRACK_TARGETS: Record<ResultAction, string> = { primary: 'next', secondary: 'replay', share: 'share' };

const sheet = css`
:host {
  display: block;
  max-width: var(--zon-result-max-width, 660px);
  margin-inline: auto;
}
.wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--_space-l);
  padding: var(--_space-l) var(--_space-m) var(--_space-m);
  text-align: center;
}
.icon {
  width: 120px;
  height: 120px;
  display: grid;
  place-items: center;
  background: var(--_bg-10);
  border: 3px solid var(--_bg-0);
  border-radius: var(--_space-m);
  transform: rotate(-2.5deg);
}
h2 { margin: 0; font-size: var(--_fs-24); }
.summary { color: var(--_text-70); }
.summary ::slotted(*) { margin: 0; }

.stats {
  display: grid;
  grid-template-columns: repeat(var(--_cols, 3), minmax(0, 1fr));
  width: 100%;
  margin: 0;
  padding: 0;
  border: 1px solid var(--_border-70);
  border-radius: var(--_radius-12);
  overflow: hidden;
}
.stat {
  display: flex;
  flex-direction: column-reverse;
  gap: 4px;
  padding: var(--_space-m);
  position: relative;
}
.stat + .stat { box-shadow: -1px 0 0 var(--_border-70); }
.stat dt { font-size: var(--_fs-14); color: var(--_text-55); }
.stat dd { margin: 0; font-size: var(--_fs-20); font-weight: 700; font-variant-numeric: tabular-nums; }
.badge {
  vertical-align: middle;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--_space-s);
  background: var(--_games-accent);
  color: #000;
}

.actions { display: flex; flex-direction: column; gap: var(--_space-s); width: 100%; }
.status { min-height: 1.2em; font-size: var(--_fs-14); color: var(--_text-55); }
`;

export class ZonGameResult extends ZonElement {
  static sheet = sheet;
  static observedAttributes = [
    'heading',
    'primary-label',
    'secondary-label',
    'share-text',
    'share-label',
  ];

  #stats: ResultStat[] = [];
  #statusTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    super();
    this.root.addEventListener('click', (e) => this.#onClick(e));
  }

  connectedCallback(): void {
    this.upgradeProperty('stats');
    this.#render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.#render();
  }

  get stats(): ResultStat[] {
    return this.#stats;
  }
  set stats(value: ResultStat[] | null | undefined) {
    this.#stats = Array.isArray(value) ? value : [];
    if (this.isConnected) this.#render();
  }

  /** Native share sheet on touch devices, otherwise copies to the clipboard. Emits zon-share. */
  async share(): Promise<void> {
    const text = this.getAttribute('share-text') ?? '';
    const url = this.getAttribute('share-url') ?? undefined;
    let method: ShareMethod = 'failed';
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ text, url });
        method = 'native';
      } else {
        await navigator.clipboard.writeText(url ? `${text}\n${url}` : text);
        method = 'clipboard';
        this.#status(this.label('copied-label', 'In die Zwischenablage kopiert'));
      }
    } catch (err) {
      method = (err as { name?: string } | null)?.name === 'AbortError' ? 'cancelled' : 'failed';
    }
    this.emit('zon-share', { method });
  }

  #status(message: string) {
    const el = this.root.querySelector('.status');
    if (!el) return;
    el.textContent = message;
    clearTimeout(this.#statusTimer);
    this.#statusTimer = setTimeout(() => (el.textContent = ''), 3000);
  }

  #onClick(e: Event) {
    const action = (e.target as Element).closest<HTMLElement>('button[data-action]')?.dataset.action as
      | ResultAction
      | undefined;
    if (!action) return;
    const target = TRACK_TARGETS[action];
    this.track({ event: 'game_interaction', action: 'click', target, position: 'closure_screen' });
    if (action === 'share') this.share();
    else this.emit(`zon-${action}`);
  }

  #render() {
    const primary = this.label('primary-label', 'Zum nächsten Rätsel');
    const secondary = this.label('secondary-label', 'Erneut spielen');
    const shareText = this.getAttribute('share-text');

    const stats = this.#stats.length
      ? `<dl class="stats" part="stats" style="--_cols: ${this.#stats.length}">${this.#stats
          .map(
            (s) => `<div class="stat" part="stat">
              <dt>${escapeHtml(s.label)}</dt>
              <dd>${escapeHtml(s.value)}${s.record || s.badge ? ` <span class="badge">${escapeHtml(s.badge ?? 'Rekord')}</span>` : ''}</dd>
            </div>`,
          )
          .join('')}</dl>`
      : '';

    this.root.innerHTML = `
      <section class="wrap" part="wrap" aria-labelledby="heading">
        <div class="icon" part="icon"><slot name="icon">${icons.party(56)}</slot></div>
        <h2 id="heading" part="heading" tabindex="-1">${escapeHtml(this.label('heading', 'Gut gemacht!'))}</h2>
        <div class="summary" part="summary"><slot name="summary"></slot></div>
        ${stats}
        <div class="actions" part="actions">
          ${primary ? `<button type="button" class="zon-button" data-action="primary">${escapeHtml(primary)}</button>` : ''}
          ${
            shareText !== null
              ? `<button type="button" class="zon-button zon-button--outline" data-action="share">${icons.share(18)} ${escapeHtml(this.label('share-label', 'Ergebnis teilen'))}</button>`
              : ''
          }
          ${secondary ? `<button type="button" class="zon-button zon-button--outline" data-action="secondary">${escapeHtml(secondary)}</button>` : ''}
        </div>
        <div class="status" role="status" aria-live="polite"></div>
        <slot></slot>
      </section>`;
  }
}

define('zon-game-result', ZonGameResult);

declare global {
  interface HTMLElementTagNameMap {
    'zon-game-result': ZonGameResult;
  }
}
