/**
 * <zon-game-timer>
 *
 * Stopwatch with play/pause, ported 1:1 from sudoku `app/components/game/stop-watch`
 * (styles from stop-watch.component.scss, icons from assets/icons/commons).
 * Unlike the Angular version, it does not tick every 100 ms. Elapsed time comes from
 * `performance.now()`, and the DOM updates only once per displayed second.
 *
 * Attributes
 *   autostart          start counting when connected
 *   disabled           button is inert (e.g. game finished)
 *   pause-when-hidden  pause automatically when the tab is hidden
 *   pause-label        "Timer pausieren"
 *   resume-label       "Timer fortsetzen"
 *
 * Properties
 *   elapsed   (ms) get or set; setting it does not change running state
 *   running   (boolean, read-only)
 *
 * Methods
 *   start(), pause(reason = 'api'), toggle(), reset(ms = 0)
 *
 * Events (bubbles, composed)
 *   zon-timer-start { elapsed }
 *   zon-timer-pause { elapsed, reason }   reason: user | hidden | api
 */
import { ZonElement, css, define } from '../shared/base.js';
import { icons } from '../shared/icons.js';

const sheet = css`
:host { display: inline-block; }
/* sudoku: padding S M S S, gap XXS, radius Border-Radius-Medium (4px), labelBold 14px. */
button {
  appearance: none;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: var(--z-ds-space-xxs, 6px);
  width: 100%;
  height: 40px;
  padding: var(--_space-s) var(--_space-m) var(--_space-s) var(--_space-s);
  border: 1px solid var(--_border-70);
  border-radius: var(--z-ds-border-radius-4, 4px);
  background: var(--_bg-0);
  color: var(--_text-100);
  font: inherit;
  font-size: var(--_fs-14);
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}
button:hover { background: var(--_bg-10); }
button:focus-visible { outline: 2px solid var(--_focus-100); outline-offset: 2px; }
:host([disabled]) button { cursor: default; opacity: 0.6; }
:host([disabled]) button:hover { background: var(--_bg-0); }
.icon { display: inline-flex; flex-shrink: 0; }
/* Fixed box, right-aligned: the digits don't move the icon while counting. */
.time { width: 44px; text-align: right; font-variant-numeric: tabular-nums; }
.time.long { width: 54px; }
`;

export function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export class ZonGameTimer extends ZonElement {
  static sheet = sheet;
  static observedAttributes = ['disabled', 'pause-label', 'resume-label'];

  #accumulated = 0; // ms counted before the current run
  #startedAt = null; // performance.now() of the current run, null when paused
  #timeout = null;
  #button;
  #time;
  #icon;
  #onVisibility = () => {
    if (document.hidden && this.running && this.hasAttribute('pause-when-hidden')) this.pause('hidden');
  };

  constructor() {
    super();
    this.root.innerHTML = `
      <button type="button" part="button" aria-describedby="time">
        <span class="icon"></span>
        <span class="time" part="time" id="time" role="timer">00:00</span>
      </button>`;
    this.#button = this.root.querySelector('button');
    this.#time = this.root.querySelector('.time');
    this.#icon = this.root.querySelector('.icon');
    this.#button.addEventListener('click', () => {
      if (!this.hasAttribute('disabled')) this.toggle('user');
    });
  }

  connectedCallback() {
    this.upgradeProperty('elapsed');
    document.addEventListener('visibilitychange', this.#onVisibility);
    if (this.hasAttribute('autostart') && !this.running) this.start();
    this.#paint();
  }

  disconnectedCallback() {
    document.removeEventListener('visibilitychange', this.#onVisibility);
    clearTimeout(this.#timeout);
  }

  attributeChangedCallback() {
    this.#paint();
  }

  get running() {
    return this.#startedAt !== null;
  }

  get elapsed() {
    return this.#accumulated + (this.running ? performance.now() - this.#startedAt : 0);
  }
  set elapsed(ms) {
    this.#accumulated = Math.max(0, Number(ms) || 0);
    if (this.running) this.#startedAt = performance.now();
    this.#paint();
  }

  start() {
    if (this.running) return;
    this.#startedAt = performance.now();
    this.#schedule();
    this.#paint();
    this.emit('zon-timer-start', { elapsed: this.elapsed });
  }

  pause(reason = 'api') {
    if (!this.running) return;
    this.#accumulated = this.elapsed;
    this.#startedAt = null;
    clearTimeout(this.#timeout);
    this.#paint();
    this.emit('zon-timer-pause', { elapsed: this.elapsed, reason });
  }

  toggle(reason = 'api') {
    this.running ? this.pause(reason) : this.start();
  }

  reset(ms = 0) {
    this.pause();
    this.elapsed = ms;
  }

  /** Wake up right after the next full second instead of polling. */
  #schedule() {
    clearTimeout(this.#timeout);
    if (!this.running) return;
    const delay = 1000 - (this.elapsed % 1000) + 5;
    this.#timeout = setTimeout(() => {
      this.#paint();
      this.#schedule();
    }, delay);
  }

  #paint() {
    const text = formatTime(this.elapsed);
    if (this.#time.textContent !== text) this.#time.textContent = text;
    this.#time.classList.toggle('long', text.length > 5);
    const running = this.running;
    const label = running
      ? this.label('pause-label', 'Timer pausieren')
      : this.label('resume-label', 'Timer fortsetzen');
    // Static name per state; the time is only a description so screen readers
    // are not interrupted every second.
    if (this.#button.getAttribute('aria-label') !== label) this.#button.setAttribute('aria-label', label);
    if (this.hasAttribute('disabled')) this.#button.setAttribute('aria-disabled', 'true');
    else this.#button.removeAttribute('aria-disabled');
    const iconName = running ? 'pause' : 'play';
    if (this.#icon.dataset.icon !== iconName) {
      this.#icon.dataset.icon = iconName;
      this.#icon.innerHTML = icons[iconName](18);
    }
  }
}

define('zon-game-timer', ZonGameTimer);
