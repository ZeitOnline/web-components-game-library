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
import { iconTemplates as ICONS } from '../shared/icons.js';

/** The built-in buttons. */
export type NavAction = 'back' | 'archive' | 'theme' | 'hint' | 'more';

/** What a handler / custom button's onClick receives. */
export interface NavContext {
  /** Built-in action or the custom button's id. */
  action: string;
  event: Event;
  element: HTMLElement;
  navigation: ZonGameNavigation;
}
/** Return false to skip the default action. */
export type NavHandler = (ctx: NavContext) => unknown;
export type NavHandlers = Partial<Record<NavAction | (string & {}), NavHandler>>;

export interface NavCustomAction {
  id: string;
  label: string;
  /** Trusted SVG string. */
  icon?: string;
  position?: 'start' | 'end';
  disabled?: boolean;
  haspopup?: boolean;
  onClick?: NavHandler;
}

type Side = 'start' | 'end';

const BUILTINS: Record<NavAction, { label: string; popup?: boolean }> = {
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

/* Round buttons: the shared .zon-button--icon (sudoku iconButton), see shared/styles.js. */
/* Wortgeflecht "icon-special" (hint) */
.icon-button[data-action='hint'] {
  background-color: var(--_games-yellow);
  border-color: var(--_games-yellow);
  color: #252525;
}
/* Used up (one tip per puzzle): plain white circle again, as in Wortgeflecht. */
.icon-button[data-action='hint']:is(:disabled, [aria-disabled='true']) {
  background-color: var(--_bg-0);
  border-color: var(--_border-100);
  color: var(--_border-100);
  opacity: 1;
}

/* sun/moon cross-fade like sudoku's darkmode-toggle */
.theme-icons { position: relative; width: 18px; height: 18px; }
.theme-icons svg { position: absolute; inset: 0; transition: opacity 200ms ease-in; }
.icon-button[aria-checked='true'] .sun,
.icon-button[aria-checked='false'] .moon { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .theme-icons svg { transition: none; }
}
@media print { :host { display: none; } }
`;

function readScheme(): 'dark' | 'light' {
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

  #handlers: NavHandlers = {};
  #customActions: NavCustomAction[] = [];
  #mql: MediaQueryList | undefined;
  #expanded = new Map<string, boolean>();
  #onScheme = () => this.#syncTheme();
  #onDialog = (e: Event) => {
    const action = this.#actionForDialog(e.target);
    if (action) this.setExpanded(action, e.type === 'zon-open');
  };

  constructor() {
    super();
    this.root.addEventListener('click', (e) => this.#onClick(e));
  }

  connectedCallback(): void {
    this.upgradeProperty('handlers');
    this.upgradeProperty('customActions');
    addEventListener('colorscheme', this.#onScheme);
    this.#mql = matchMedia('(prefers-color-scheme: dark)');
    this.#mql.addEventListener('change', this.#onScheme);
    document.addEventListener('zon-open', this.#onDialog);
    document.addEventListener('zon-close', this.#onDialog);
    this.#render();
  }

  disconnectedCallback(): void {
    removeEventListener('colorscheme', this.#onScheme);
    this.#mql?.removeEventListener('change', this.#onScheme);
    document.removeEventListener('zon-open', this.#onDialog);
    document.removeEventListener('zon-close', this.#onDialog);
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.#render();
  }

  /** Callbacks per action. Return false from a handler to skip the default action. */
  get handlers(): NavHandlers {
    return this.#handlers;
  }
  set handlers(value: NavHandlers | null | undefined) {
    this.#handlers = value && typeof value === 'object' ? value : {};
  }

  get customActions(): NavCustomAction[] {
    return this.#customActions;
  }
  set customActions(value: NavCustomAction[] | null | undefined) {
    this.#customActions = Array.isArray(value) ? value : [];
    if (this.isConnected) this.#render();
  }

  /** aria-expanded for menus not managed via <action>-dialog. */
  setExpanded(action: string, expanded: boolean): void {
    this.#expanded.set(action, Boolean(expanded));
    this.root.querySelector(`[data-action="${action}"]`)?.setAttribute('aria-expanded', String(Boolean(expanded)));
  }

  setDisabled(action: string, disabled: boolean): void {
    const list = new Set((this.getAttribute('disabled-actions') ?? '').split(/\s+/).filter(Boolean));
    if (disabled) list.add(action);
    else list.delete(action);
    this.setAttribute('disabled-actions', [...list].join(' '));
  }

  #actions(side: Side): NavAction[] {
    const fallback = side === 'start' ? 'back archive' : 'theme more';
    return (this.getAttribute(`${side}-actions`) ?? fallback)
      .split(/\s+/)
      .filter((a): a is NavAction => a in BUILTINS);
  }

  #actionForDialog(dialog: EventTarget | null): NavAction | null {
    if (!(dialog instanceof Element) || !dialog.id) return null;
    for (const action of Object.keys(BUILTINS) as NavAction[]) {
      if (this.getAttribute(`${action}-dialog`) === dialog.id) return action;
    }
    return null;
  }

  #button(action: NavAction): string {
    const disabled = (this.getAttribute('disabled-actions') ?? '').split(/\s+/).includes(action);
    const label = escapeHtml(this.label(`${action}-label`, BUILTINS[action].label));
    if (action === 'back' && this.hasAttribute('back-href')) {
      return `<a class="zon-button zon-button--icon icon-button" part="button button-back" data-action="back" href="${escapeHtml(this.getAttribute('back-href'))}" aria-label="${label}">${ICONS.back}</a>`;
    }
    if (action === 'theme') {
      const dark = readScheme() === 'dark';
      return `<button type="button" class="zon-button zon-button--icon icon-button" part="button button-theme" data-action="theme" role="switch"
        aria-checked="${dark}" aria-label="${label}" ${disabled ? 'disabled' : ''}>
        <span class="theme-icons"><span class="sun">${ICONS.sun}</span><span class="moon">${ICONS.moon}</span></span></button>`;
    }
    const popup = BUILTINS[action].popup
      ? `aria-haspopup="dialog" aria-expanded="${this.#expanded.get(action) ?? false}"`
      : '';
    return `<button type="button" class="zon-button zon-button--icon icon-button" part="button button-${action}" data-action="${action}"
      aria-label="${label}" ${popup} ${disabled ? 'disabled' : ''}>${ICONS[action]}</button>`;
  }

  #customButton(item: NavCustomAction, index: number): string {
    const label = escapeHtml(item.label ?? item.id);
    return `<button type="button" class="zon-button zon-button--icon icon-button" part="button button-${escapeHtml(item.id)}" data-custom="${index}"
      aria-label="${label}" ${item.disabled ? 'disabled' : ''} ${item.haspopup ? 'aria-haspopup="dialog" aria-expanded="false"' : ''}>${item.icon ?? ''}</button>`;
  }

  #group(side: Side): string {
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

  #onClick(event: Event) {
    const button = (event.target as Element).closest<HTMLElement>('[data-action], [data-custom]');
    if (!button || (button as HTMLButtonElement).disabled) return;

    const custom = button.dataset.custom !== undefined ? (this.#customActions[Number(button.dataset.custom)] ?? null) : null;
    const action = custom ? custom.id : (button.dataset.action ?? '');
    const ctx: NavContext = { action, event, element: button, navigation: this };

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
    if (dialogId) (document.getElementById(dialogId) as (HTMLElement & { show?: () => void }) | null)?.show?.();
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

declare global {
  interface HTMLElementTagNameMap {
    'zon-game-navigation': ZonGameNavigation;
  }
}
