/**
 * <zon-game-navigation>
 *
 * In-game header bar: round icon buttons on the left, centred title, round icon
 * buttons on the right. Ported from sudoku `game/game-header` (+ `darkmode-toggle`),
 * which wortiger copies. Wortgeflecht's `GameHeader.svelte` has the same structure
 * with a hint button instead of the dark-mode toggle.
 *
 * Attributes
 *   heading          title in the middle, e.g. "Sudoku Leicht" (or use slot="title")
 *   heading-level    render the title as h1–h6 (default: plain div, as in sudoku)
 *   start-actions    space-separated built-in actions on the left   (default "back archive")
 *   end-actions      space-separated built-in actions on the right  (default "theme more")
 *   back-href        makes "back" a real link (works without JS)
 *   disabled-actions space-separated actions to disable, e.g. "hint"
 *   <action>-dialog  id of a <zon-game-dialog> to open, e.g. archive-dialog="archive"
 *                    (aria-expanded is kept in sync automatically)
 *   <action>-label   overrides an aria-label, e.g. more-label="Menü"
 *
 * Built-in actions
 *   back     chevron    "Zurück zur Startseite"
 *   archive  calendar   "Archiv öffnen"           (aria-haspopup=dialog)
 *   theme    sun/moon   "Dunkelmodus"             (role=switch; default action toggles
 *                                                  html.color-scheme-dark/-light and fires
 *                                                  window 'colorscheme', like sudoku's Frame)
 *   hint     bulb       "Tipp einlösen"           (accent style, as in Wortgeflecht)
 *   more     ellipsis   "Mehr Optionen anzeigen"  (aria-haspopup=dialog)
 *
 * Callbacks – three ways, use whichever fits the framework:
 *
 *   1. handlers property (plain functions, good for Svelte / vanilla):
 *        nav.handlers = {
 *          back:    ({ event }) => router.goto('/'),
 *          archive: () => archive.show(),
 *          more:    () => false,            // returning false skips the default action
 *        };
 *
 *   2. events (good for Angular `(zon-nav)="…"` or addEventListener):
 *        zon-nav            { action, source: 'builtin' | 'custom' }   cancelable
 *        zon-theme-change   { scheme: 'dark' | 'light' }
 *      preventDefault() on zon-nav skips the default action.
 *
 *   3. custom buttons (property `customActions`):
 *        nav.customActions = [
 *          { id: 'print', label: 'Drucken', icon: '<svg…>', position: 'end', onClick: () => print() },
 *        ];
 *      `onClick` receives the same context as handlers and also fires zon-nav.
 *
 *   Order: handler/onClick → zon-nav event → default action (dialog / link / theme).
 *
 * Methods
 *   setExpanded(action, bool)   aria-expanded for menus not managed via <action>-dialog
 *   setDisabled(action, bool)
 *
 * Slots
 *   title   rich title content instead of `heading`
 *   start / end   any extra elements appended to the left / right group
 *
 * Events also emit `zon-track` { event: 'game_interaction', action: 'click', target: <action>, position: 'ingame' }.
 */
import { ZonElement, css, define, escapeHtml } from '../shared/base.js';

/* Icons copied from sudoku assets/icons (commons/chevron-left, commons/date,
   commons/ellipsis, sun, moon) and Wortgeflecht LightBulbIcon.svelte. */
const ICONS = {
  back: `<svg width="17" height="17" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.46966 6.46967L9.46966 0.469666L10.5303 1.53033L5.06065 7L10.5303 12.4697L9.46966 13.5303L3.46966 7.53033L2.93933 7L3.46966 6.46967Z" fill="currentColor"/></svg>`,
  archive: `<svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.25 1C5.66421 1 6 1.33579 6 1.75V3.25H12V1.75C12 1.33579 12.3358 1 12.75 1C13.1642 1 13.5 1.33579 13.5 1.75V3.25H15C15.9665 3.25 16.75 4.0335 16.75 5V14C16.75 14.9665 15.9665 15.75 15 15.75H6.5H3C2.0335 15.75 1.25 14.9665 1.25 14V5C1.25 4.0335 2.0335 3.25 3 3.25H4.5V1.75C4.5 1.33579 4.83579 1 5.25 1ZM6 4.75H12V5.25C12 5.66421 12.3358 6 12.75 6C13.1642 6 13.5 5.66421 13.5 5.25V4.75H15C15.1381 4.75 15.25 4.86193 15.25 5V7.5H2.75V5C2.75 4.86193 2.86193 4.75 3 4.75H4.5V5.25C4.5 5.66421 4.83579 6 5.25 6C5.66421 6 6 5.66421 6 5.25V4.75ZM2.75 9V14C2.75 14.1381 2.86193 14.25 3 14.25H6.5H15C15.1381 14.25 15.25 14.1381 15.25 14V9H2.75Z" fill="currentColor"/></svg>`,
  more: `<svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><circle cx="9" cy="9" r="1.5" fill="currentColor"/><circle cx="4" cy="9" r="1.5" fill="currentColor"/><circle cx="14" cy="9" r="1.5" fill="currentColor"/></svg>`,
  sun: `<svg width="18" height="18" viewBox="0 0 19 18" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.25 3.5V1H8.75V3.5H10.25ZM3.31282 3.87348L5.08058 5.64124L6.14124 4.58058L4.37348 2.81282L3.31282 3.87348ZM14.6265 2.8133L12.8588 4.58107L13.9194 5.64173L15.6872 3.87396L14.6265 2.8133ZM4 8.25H1.5V9.75H4V8.25ZM17.5 8.25H15V9.75H17.5V8.25ZM12.8588 13.4194L14.6265 15.1872L15.6872 14.1265L13.9194 12.3588L12.8588 13.4194ZM5.08058 12.3592L3.31282 14.127L4.37348 15.1877L6.14124 13.4199L5.08058 12.3592ZM10.25 17V14.5H8.75V17H10.25ZM7 9C7 7.61929 8.11929 6.5 9.5 6.5C10.8807 6.5 12 7.61929 12 9C12 10.3807 10.8807 11.5 9.5 11.5C8.11929 11.5 7 10.3807 7 9ZM9.5 5C7.29086 5 5.5 6.79086 5.5 9C5.5 11.2091 7.29086 13 9.5 13C11.7091 13 13.5 11.2091 13.5 9C13.5 6.79086 11.7091 5 9.5 5Z" fill="currentColor"/></svg>`,
  moon: `<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><mask id="moon-mask" fill="white"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.76768 1.09424C3.93448 1.6869 1 5.00071 1 8.99991C1 13.4182 4.58172 16.9999 9 16.9999C13.3022 16.9999 16.8113 13.6039 16.9926 9.34629C14.6499 10.9155 11.688 11.0469 9.5141 9.43643C7.04066 7.60409 6.39245 4.11328 7.76768 1.09424Z"/></mask><path d="M7.76768 1.09424L9.13273 1.71605L10.2846 -0.812738L7.53848 -0.388148L7.76768 1.09424ZM16.9926 9.34629L18.4913 9.41014L18.6173 6.4527L16.1579 8.10003L16.9926 9.34629ZM9.5141 9.43643L8.62121 10.6417L9.5141 9.43643ZM2.5 8.99991C2.5 5.75194 4.88369 3.05796 7.99687 2.57662L7.53848 -0.388148C2.98527 0.315835 -0.5 4.24948 -0.5 8.99991H2.5ZM9 15.4999C5.41015 15.4999 2.5 12.5898 2.5 8.99991H-0.5C-0.5 14.2466 3.75329 18.4999 9 18.4999V15.4999ZM15.494 9.28245C15.3467 12.7406 12.4952 15.4999 9 15.4999V18.4999C14.1093 18.4999 18.2758 14.4671 18.4913 9.41014L15.494 9.28245ZM16.1579 8.10003C14.2477 9.37951 11.9861 9.40091 10.407 8.23113L8.62121 10.6417C11.39 12.6928 15.0522 12.4514 17.8274 10.5926L16.1579 8.10003ZM10.407 8.23113C8.60866 6.89892 7.99233 4.21956 9.13273 1.71605L6.40263 0.472431C4.79256 4.007 5.47266 8.30927 8.62121 10.6417L10.407 8.23113Z" fill="currentColor" mask="url(#moon-mask)"/></svg>`,
  hint: `<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10 9.3335C10.1333 8.66683 10.4667 8.20016 11 7.66683C11.6667 7.06683 12 6.20016 12 5.3335C12 4.27263 11.5786 3.25521 10.8284 2.50507C10.0783 1.75492 9.06087 1.3335 8 1.3335C6.93913 1.3335 5.92172 1.75492 5.17157 2.50507C4.42143 3.25521 4 4.27263 4 5.3335C4 6.00016 4.13333 6.80016 5 7.66683C5.46667 8.1335 5.86667 8.66683 6 9.3335"/><path d="M6 12H10"/><path d="M6.66602 14.6665H9.33268"/></svg>`,
};

const BUILTINS = {
  back: { label: 'Zurück zur Startseite' },
  archive: { label: 'Archiv öffnen', popup: true },
  theme: { label: 'Dunkelmodus' },
  hint: { label: 'Tipp einlösen' },
  more: { label: 'Mehr Optionen anzeigen', popup: true },
};

const sheet = css`
/* sudoku game-header + iconButton mixin */
:host { display: block; width: 100%; box-sizing: border-box; }
.bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--_space-xs);
  padding: var(--_space-s) 0;
}
.group { display: flex; align-items: center; gap: var(--_space-s); min-width: 0; }
.group.end { justify-content: flex-end; gap: var(--_space-xs); }
@media (min-width: 768px) { .group.start { gap: var(--_space-xs); } }

.title {
  margin: 0;
  padding: 0 var(--_space-s);
  font-size: var(--_fs-16);
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 43px;
  height: 43px;
  padding: var(--_space-s);
  border: 1px solid var(--z-ds-color-border-100, #cccccf);
  border-radius: 50%;
  background-color: var(--_bg-0);
  color: var(--link-color, var(--_text-70));
  font: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 200ms ease-out;
}
.icon-button:hover { background-color: var(--z-ds-color-border-100, #cccccf); }
.icon-button:focus-visible { outline: 2px solid var(--_focus-100); outline-offset: 2px; }
.icon-button:disabled, .icon-button[aria-disabled='true'] { opacity: 0.4; cursor: default; background-color: var(--_bg-0); }
.icon-button svg { display: block; flex-shrink: 0; }

/* Wortgeflecht "icon-special" (hint) */
.icon-button[data-action='hint'] {
  background-color: var(--_games-yellow);
  border-color: var(--_games-yellow);
  color: #252525;
}

/* sun/moon cross-fade like sudoku's darkmode-toggle */
.theme-icons { position: relative; width: 18px; height: 18px; }
.theme-icons svg { position: absolute; inset: 0; transition: opacity 200ms ease-in; }
.icon-button[aria-checked='true'] .sun,
.icon-button[aria-checked='false'] .moon { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .icon-button, .theme-icons svg { transition: none; }
}
@media print { :host { display: none; } }
`;

function readScheme() {
  const html = document.documentElement.classList;
  if (html.contains('color-scheme-dark')) return 'dark';
  if (html.contains('color-scheme-light')) return 'light';
  try {
    const stored = localStorage.getItem('color-scheme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export class ZonGameNavigation extends ZonElement {
  static sheet = sheet;
  static observedAttributes = ['heading', 'heading-level', 'start-actions', 'end-actions', 'back-href', 'disabled-actions'];

  #handlers = {};
  #customActions = [];
  #mql;
  #expanded = new Map();
  #onScheme = () => this.#syncTheme();
  #onDialog = (e) => {
    const action = this.#actionForDialog(e.target);
    if (action) this.setExpanded(action, e.type === 'zon-open');
  };

  constructor() {
    super();
    this.root.addEventListener('click', (e) => this.#onClick(e));
  }

  connectedCallback() {
    this.upgradeProperty('handlers');
    this.upgradeProperty('customActions');
    addEventListener('colorscheme', this.#onScheme);
    this.#mql = matchMedia('(prefers-color-scheme: dark)');
    this.#mql.addEventListener('change', this.#onScheme);
    document.addEventListener('zon-open', this.#onDialog);
    document.addEventListener('zon-close', this.#onDialog);
    this.#render();
  }

  disconnectedCallback() {
    removeEventListener('colorscheme', this.#onScheme);
    this.#mql?.removeEventListener('change', this.#onScheme);
    document.removeEventListener('zon-open', this.#onDialog);
    document.removeEventListener('zon-close', this.#onDialog);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  /** @type {Record<string, (ctx: {action: string, event: Event, element: HTMLElement, navigation: ZonGameNavigation}) => unknown>} */
  get handlers() {
    return this.#handlers;
  }
  set handlers(value) {
    this.#handlers = value && typeof value === 'object' ? value : {};
  }

  get customActions() {
    return this.#customActions;
  }
  set customActions(value) {
    this.#customActions = Array.isArray(value) ? value : [];
    if (this.isConnected) this.#render();
  }

  setExpanded(action, expanded) {
    this.#expanded.set(action, Boolean(expanded));
    this.root.querySelector(`[data-action="${action}"]`)?.setAttribute('aria-expanded', String(Boolean(expanded)));
  }

  setDisabled(action, disabled) {
    const list = new Set((this.getAttribute('disabled-actions') ?? '').split(/\s+/).filter(Boolean));
    disabled ? list.add(action) : list.delete(action);
    this.setAttribute('disabled-actions', [...list].join(' '));
  }

  #actions(side) {
    const fallback = side === 'start' ? 'back archive' : 'theme more';
    return (this.getAttribute(`${side}-actions`) ?? fallback).split(/\s+/).filter((a) => a in BUILTINS);
  }

  #actionForDialog(dialog) {
    if (!dialog?.id) return null;
    for (const action of Object.keys(BUILTINS)) {
      if (this.getAttribute(`${action}-dialog`) === dialog.id) return action;
    }
    return null;
  }

  #button(action) {
    const disabled = (this.getAttribute('disabled-actions') ?? '').split(/\s+/).includes(action);
    const label = escapeHtml(this.label(`${action}-label`, BUILTINS[action].label));
    if (action === 'back' && this.hasAttribute('back-href')) {
      return `<a class="icon-button" part="button button-back" data-action="back" href="${escapeHtml(this.getAttribute('back-href'))}" aria-label="${label}">${ICONS.back}</a>`;
    }
    if (action === 'theme') {
      const dark = readScheme() === 'dark';
      return `<button type="button" class="icon-button" part="button button-theme" data-action="theme" role="switch"
        aria-checked="${dark}" aria-label="${label}" ${disabled ? 'disabled' : ''}>
        <span class="theme-icons"><span class="sun">${ICONS.sun}</span><span class="moon">${ICONS.moon}</span></span></button>`;
    }
    const popup = BUILTINS[action].popup
      ? `aria-haspopup="dialog" aria-expanded="${this.#expanded.get(action) ?? false}"`
      : '';
    return `<button type="button" class="icon-button" part="button button-${action}" data-action="${action}"
      aria-label="${label}" ${popup} ${disabled ? 'disabled' : ''}>${ICONS[action]}</button>`;
  }

  #customButton(item, index) {
    const label = escapeHtml(item.label ?? item.id);
    return `<button type="button" class="icon-button" part="button button-${escapeHtml(item.id)}" data-custom="${index}"
      aria-label="${label}" ${item.disabled ? 'disabled' : ''} ${item.haspopup ? 'aria-haspopup="dialog" aria-expanded="false"' : ''}>${item.icon ?? ''}</button>`;
  }

  #group(side) {
    const builtins = this.#actions(side).map((a) => this.#button(a));
    const custom = this.#customActions
      .map((item, i) => ((item.position ?? 'end') === side ? this.#customButton(item, i) : ''))
      .filter(Boolean);
    return `<div class="group ${side}" part="${side}">${[...builtins, ...custom].join('')}<slot name="${side}"></slot></div>`;
  }

  #render() {
    const level = Number(this.getAttribute('heading-level'));
    const tag = level >= 1 && level <= 6 ? `h${level}` : 'div';
    this.root.innerHTML = `
      <nav class="bar" part="bar" aria-label="${escapeHtml(this.label('nav-label', 'Spielnavigation'))}">
        ${this.#group('start')}
        <${tag} class="title" part="title"><slot name="title">${escapeHtml(this.getAttribute('heading') ?? '')}</slot></${tag}>
        ${this.#group('end')}
      </nav>`;
  }

  #syncTheme() {
    const button = this.root.querySelector('[data-action="theme"]');
    button?.setAttribute('aria-checked', String(readScheme() === 'dark'));
  }

  #onClick(event) {
    const button = event.target.closest('[data-action], [data-custom]');
    if (!button || button.disabled) return;

    const custom = button.dataset.custom !== undefined ? this.#customActions[Number(button.dataset.custom)] : null;
    const action = custom ? custom.id : button.dataset.action;
    const ctx = { action, event, element: button, navigation: this };

    // 1. callback
    const callback = custom ? custom.onClick : this.handlers?.[action];
    let proceed = true;
    if (typeof callback === 'function') {
      try {
        if (callback(ctx) === false) proceed = false;
      } catch (err) {
        console.error(`<zon-game-navigation>: handler "${action}" threw`, err);
      }
    }

    // 2. event
    this.track({ event: 'game_interaction', action: 'click', target: action, position: 'ingame' });
    if (!this.emit('zon-nav', { action, source: custom ? 'custom' : 'builtin' }, { cancelable: true })) proceed = false;

    if (!proceed) {
      if (button.tagName === 'A') event.preventDefault();
      return;
    }

    // 3. default action
    if (action === 'theme' && !custom) {
      this.#toggleTheme();
      return;
    }
    const dialogId = this.getAttribute(`${action}-dialog`);
    if (dialogId) document.getElementById(dialogId)?.show?.();
  }

  /** Same behaviour as sudoku's Frame.toggleDarkMode(). */
  #toggleTheme() {
    const html = document.documentElement.classList;
    const scheme = readScheme() === 'dark' ? 'light' : 'dark';
    html.remove(`color-scheme-${scheme === 'dark' ? 'light' : 'dark'}`);
    html.add(`color-scheme-${scheme}`);
    dispatchEvent(new CustomEvent('colorscheme', { detail: scheme }));
    this.emit('zon-theme-change', { scheme });
    this.#syncTheme();
  }
}

define('zon-game-navigation', ZonGameNavigation);
