/**
 * <zon-game-instructions>
 *
 * The "So wird gespielt" stepper. Its copies are Wortgeflecht `InstructionsDialog.svelte`,
 * sudoku `app/components/game/instructions` and wortiger `app/components/instructions`.
 * All three share the same data shape (`GAME_INSTRUCTIONS`) and markup.
 * Usually placed inside <zon-game-dialog variant="wide">.
 *
 * Data (property `steps`, or a child <script type="application/json">)
 *   [{ title, description, descriptionTwo?, svg?, image?, imageAlt? }]
 *   description / descriptionTwo / svg are TRUSTED HTML from the game repo
 *   (same as the existing `{@html}` / `[innerHTML]` usage). Never pass user input.
 *
 * Attributes
 *   step                  current step index (0-based), reflects
 *   prev-label            "Vorheriger Schritt"
 *   next-label            "Weiter"
 *   skip-label            "Tutorial überspringen"
 *   start-label           "Rätsel starten"
 *   restart-label         "Tutorial erneut ansehen"
 *
 * Events (bubbles, composed)
 *   zon-step-change { step, previous, direction }
 *   zon-complete    { step }   cancelable; default action closes the parent dialog
 *   zon-skip        { step }   cancelable; default action closes the parent dialog
 *   zon-track       { event: 'game_rules', action, position, max_position }
 */
import { ZonElement, css, define, escapeHtml } from '../shared/base.js';
import { icons } from '../shared/icons.js';

const sheet = css`
:host { display: block; }
.top { min-height: 44px; display: flex; align-items: center; }
.top .zon-button { padding-inline: 0; }

.slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--_space-m);
  text-align: center;
}
.slide h3 { margin: 0; font-size: var(--_fs-20); }
.slide p { margin: 0; color: var(--_text-70); }
.media { width: 100%; display: flex; justify-content: center; }
.media :is(svg, img) { max-width: 100%; height: auto; max-height: 240px; }

.dots {
  display: flex;
  justify-content: center;
  gap: var(--_space-xs);
  margin-block: var(--_space-l) var(--_space-m);
}
.dot {
  width: 24px; height: 24px; padding: 0; border: 0; background: none; cursor: pointer;
  display: grid; place-items: center;
}
.dot::before {
  content: ''; width: 8px; height: 8px; border-radius: 50%;
  background: var(--_border-70);
  transition: background 0.2s, width 0.2s;
}
.dot[aria-current='step']::before { background: var(--_text-100); width: 20px; border-radius: 4px; }
.dot:focus-visible { outline: 2px solid var(--_focus-100); border-radius: 4px; }

.actions { display: flex; flex-direction: column; gap: var(--_space-xs); }
`;

export class ZonGameInstructions extends ZonElement {
  static sheet = sheet;
  static observedAttributes = ['step', 'prev-label', 'next-label', 'skip-label', 'start-label', 'restart-label'];

  #steps = [];

  constructor() {
    super();
    this.root.addEventListener('click', (e) => this.#onClick(e));
  }

  connectedCallback() {
    this.upgradeProperty('steps');
    if (!this.#steps.length) {
      const script = this.querySelector('script[type="application/json"]');
      if (script) {
        try {
          this.#steps = JSON.parse(script.textContent);
        } catch (err) {
          console.error('<zon-game-instructions>: invalid JSON steps', err);
        }
      }
    }
    this.#render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  get steps() {
    return this.#steps;
  }
  set steps(value) {
    this.#steps = Array.isArray(value) ? value : [];
    if (this.step >= this.#steps.length) this.step = 0;
    if (this.isConnected) this.#render();
  }

  get step() {
    const n = Number(this.getAttribute('step') ?? 0);
    return Number.isInteger(n) && n >= 0 ? n : 0;
  }
  set step(value) {
    this.setAttribute('step', String(value));
  }

  /** Go to a step. Emits zon-step-change and a tracking event. */
  goTo(next, action) {
    const previous = this.step;
    const max = this.#steps.length - 1;
    const target = Math.max(0, Math.min(next, max));
    if (target === previous) return;
    this.step = target;
    const direction = target > previous ? 'forward' : 'backward';
    this.emit('zon-step-change', { step: target, previous, direction });
    this.#track(action ?? direction, target);
  }

  /** Re-rendering replaces the buttons; keep keyboard focus on the equivalent control. */
  #restoreFocus(action, index) {
    const selector = action === 'dot' ? `[data-index="${index}"]` : `[data-action="${action}"]:not([hidden])`;
    (this.root.querySelector(selector) ?? this.root.querySelector('.actions .zon-button'))?.focus();
  }

  #track(action, step) {
    this.track({
      event: 'game_rules',
      action,
      position: String(step + 1),
      max_position: String(this.#steps.length),
    });
  }

  #finish(type) {
    const step = this.step;
    this.#track(type === 'zon-skip' ? 'skip' : 'close', step);
    const notCancelled = this.emit(type, { step }, { cancelable: true });
    if (notCancelled) this.closest('zon-game-dialog')?.close(type === 'zon-skip' ? 'skip' : 'complete');
  }

  #onClick(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;
    const { action, index } = button.dataset;
    if (action === 'skip') return this.#finish('zon-skip');
    if (action === 'start') return this.#finish('zon-complete');
    if (action === 'prev') this.goTo(this.step - 1);
    else if (action === 'next') this.goTo(this.step + 1);
    else if (action === 'dot') this.goTo(Number(index));
    else if (action === 'restart') this.goTo(0, 'restart');
    this.#restoreFocus(action, index);
  }

  #render() {
    const steps = this.#steps;
    if (!steps.length) {
      this.root.innerHTML = '<slot></slot>';
      return;
    }
    const i = Math.min(this.step, steps.length - 1);
    const s = steps[i];
    const last = i === steps.length - 1;
    const media = s.svg
      ? `<div class="media" aria-hidden="true">${s.svg}</div>`
      : s.image
        ? `<div class="media"><img src="${escapeHtml(s.image)}" alt="${escapeHtml(s.imageAlt ?? '')}" loading="lazy"></div>`
        : '';

    this.root.innerHTML = `
      <div class="top">
        <button type="button" class="zon-button zon-button--text" data-action="prev" ${i === 0 ? 'hidden' : ''}>
          ${icons.chevronLeft(18)} ${escapeHtml(this.label('prev-label', 'Vorheriger Schritt'))}
        </button>
      </div>
      <div class="slide" part="slide" tabindex="-1" aria-live="polite"
           aria-label="Schritt ${i + 1} von ${steps.length}" role="group">
        <h3 part="slide-title">${escapeHtml(s.title)}</h3>
        ${s.description ? `<p>${s.description}</p>` : ''}
        ${media}
        ${s.descriptionTwo ? `<p>${s.descriptionTwo}</p>` : ''}
      </div>
      <div class="dots" role="group" aria-label="Fortschritt">
        ${steps
          .map(
            (_, n) => `<button type="button" class="dot" data-action="dot" data-index="${n}"
              aria-label="Schritt ${n + 1} von ${steps.length}" ${n === i ? 'aria-current="step"' : ''}></button>`,
          )
          .join('')}
      </div>
      <div class="actions" part="actions">
        ${
          last
            ? `<button type="button" class="zon-button" data-action="start">${escapeHtml(this.label('start-label', 'Rätsel starten'))}</button>
               <button type="button" class="zon-button zon-button--text" data-action="restart">${escapeHtml(this.label('restart-label', 'Tutorial erneut ansehen'))}</button>`
            : `<button type="button" class="zon-button" data-action="next">${escapeHtml(this.label('next-label', 'Weiter'))}</button>
               <button type="button" class="zon-button zon-button--text" data-action="skip">${escapeHtml(this.label('skip-label', 'Tutorial überspringen'))}</button>`
        }
      </div>`;
  }
}

define('zon-game-instructions', ZonGameInstructions);
