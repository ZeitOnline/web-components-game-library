/**
 * <zon-game-feedback-button>
 *
 * The yellow "Feedback zum Sudoku" button that opens a Typeform survey in a popup. Its
 * copies are the `.typeform-survey-wrapper` snippets in sudoku, wortiger, eckchen, hashi
 * and umdieecke (index*.html) and adventszeit's `ArchiveImageEndScreen.svelte`: the same
 * inline-styled `<button data-tf-popup>` plus the Typeform embed script on every page.
 *
 * Here the button is a real link to the form, so it works without JavaScript (the form
 * opens in a new tab). With JavaScript, a click opens the Typeform popup instead. The
 * embed SDK is loaded only when needed (on hover, focus or click), not on page load.
 *
 * Attributes
 *   form-id     Typeform form id, e.g. "obbQ8AeR" (required)
 *   game-name   "Sudoku": default label "Feedback zum Sudoku" and the popup's iframe title
 *   label       overrides the label, e.g. "Zur Umfrage"
 *   medium      Typeform `medium` (default "snippet", as in the games)
 *   embed-src   URL of the embed SDK (default https://embed.typeform.com/next/embed.js),
 *               e.g. a self-hosted copy like sudoku's assets/scripts/embed.js
 *
 * Properties
 *   hiddenFields   { [name]: string } Typeform hidden fields, e.g. { difficulty: 'leicht' }
 *
 * Methods
 *   open(), close()
 *
 * Events (bubbles, composed)
 *   zon-feedback-open    { formId }              cancelable: preventDefault() keeps it closed
 *   zon-feedback-close   { formId }
 *   zon-feedback-submit  { formId, responseId }
 *   zon-track            { event: 'game_interaction', action: 'click', target: 'feedback', position: 'survey' }
 */
import { ZonElement, css, define, escapeHtml } from '../shared/base.js';

const DEFAULT_SDK = 'https://embed.typeform.com/next/embed.js';

/** @type {Promise<any> | undefined} */
let sdk;

/** Loads the Typeform embed SDK once per page (or reuses one the page already has). */
function loadTypeform(src) {
  if (window.tf?.createPopup) return Promise.resolve(window.tf);
  sdk ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => (window.tf?.createPopup ? resolve(window.tf) : reject(new Error(`${src} did not define window.tf`)));
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.append(script);
  }).catch((err) => {
    sdk = undefined; // allow a retry
    throw err;
  });
  return sdk;
}

const sheet = css`
/* Port of the games' inline Typeform snippet styles. Spacing around it is the page's job
   (the games use 52px above the button). */
:host {
  display: flex;
  justify-content: center;
}
.button {
  display: inline-block;
  max-width: 100%;
  height: 50px;
  padding: 0 33px;
  border-radius: 25px;
  background: var(--_games-yellow);
  color: #000;
  font-size: 20px;
  font-weight: 700;
  line-height: 50px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}
.button:focus-visible {
  outline: 2px solid var(--_focus-100);
  outline-offset: 2px;
}
.button[aria-busy='true'] { cursor: progress; }
@media print { :host { display: none; } }
`;

export class ZonGameFeedbackButton extends ZonElement {
  static sheet = sheet;
  static observedAttributes = ['form-id', 'game-name', 'label', 'medium', 'embed-src'];

  #hiddenFields = {};
  #popup = null;

  constructor() {
    super();
    // Warm up: start loading the SDK as soon as the user is likely to click.
    const preload = () => this.#formId && loadTypeform(this.#sdkSrc).catch(() => {});
    this.root.addEventListener('pointerenter', preload, true);
    this.root.addEventListener('focusin', preload);
    this.root.addEventListener('click', (e) => {
      if (!e.target.closest('.button')) return;
      // Modified clicks (new tab / window) keep the plain link behaviour.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      this.track({ event: 'game_interaction', action: 'click', target: 'feedback', position: 'survey' });
      this.open();
    });
  }

  connectedCallback() {
    this.upgradeProperty('hiddenFields');
    this.#render();
  }

  disconnectedCallback() {
    this.#reset();
  }

  attributeChangedCallback() {
    this.#reset();
    if (this.isConnected) this.#render();
  }

  get hiddenFields() {
    return this.#hiddenFields;
  }
  set hiddenFields(value) {
    this.#hiddenFields = value && typeof value === 'object' ? value : {};
    this.#reset();
    if (this.isConnected) this.#render();
  }

  get #formId() {
    return this.getAttribute('form-id') ?? '';
  }

  get #sdkSrc() {
    return this.getAttribute('embed-src') || DEFAULT_SDK;
  }

  /** Public form URL with hidden fields (Typeform reads them from the hash). */
  get #href() {
    const hidden = new URLSearchParams(Object.entries(this.#hiddenFields).map(([k, v]) => [k, String(v)])).toString();
    return `https://form.typeform.com/to/${encodeURIComponent(this.#formId)}${hidden ? `#${hidden}` : ''}`;
  }

  async open() {
    const formId = this.#formId;
    if (!formId) return;
    if (!this.emit('zon-feedback-open', { formId }, { cancelable: true })) return;
    const button = this.root.querySelector('.button');
    button?.setAttribute('aria-busy', 'true');
    try {
      const tf = await loadTypeform(this.#sdkSrc);
      this.#popup ??= tf.createPopup(formId, {
        medium: this.getAttribute('medium') || 'snippet',
        iframeProps: { title: this.label('game-name', 'Feedback') },
        hidden: this.#hiddenFields,
        onClose: () => this.emit('zon-feedback-close', { formId }),
        onSubmit: ({ responseId } = {}) => this.emit('zon-feedback-submit', { formId, responseId }),
      });
      this.#popup.open();
    } catch (err) {
      // SDK blocked or offline: fall back to the form itself.
      console.warn('<zon-game-feedback-button>:', err);
      window.open(this.#href, '_blank', 'noopener');
    } finally {
      button?.removeAttribute('aria-busy');
    }
  }

  close() {
    this.#popup?.close();
  }

  /** Options changed: build a new popup on the next open. */
  #reset() {
    this.#popup?.unmount?.();
    this.#popup = null;
  }

  #render() {
    const name = this.getAttribute('game-name');
    const label = this.label('label', name ? `Feedback zum ${name}` : 'Feedback geben');
    this.root.innerHTML = `<a class="button" part="button" href="${escapeHtml(this.#href)}" target="_blank" rel="noopener"
      aria-haspopup="dialog">${escapeHtml(label)}</a>`;
  }
}

define('zon-game-feedback-button', ZonGameFeedbackButton);
