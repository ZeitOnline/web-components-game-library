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
 *   embed-css   URL of the popup stylesheet (default https://embed.typeform.com/next/css/popup.css).
 *               createPopup() does not inject it (only embed.js's data-tf-popup scan does), and
 *               without it the popup renders unstyled at the end of <body>, i.e. invisible.
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
const DEFAULT_CSS = 'https://embed.typeform.com/next/css/popup.css';

/** The part of the Typeform embed SDK (window.tf) this component uses. */
interface TypeformPopup {
  open(): void;
  close(): void;
  unmount?(): void;
}
interface TypeformSdk {
  createPopup(formId: string, options: Record<string, unknown>): TypeformPopup;
}
// Not declared on the global Window, so it can't clash with a game's own typing.
const typeform = (): TypeformSdk | undefined => (window as Window & { tf?: TypeformSdk }).tf;

let sdk: Promise<TypeformSdk> | undefined;

/** Loads the Typeform embed SDK once per page (or reuses one the page already has). */
function loadTypeform(src: string): Promise<TypeformSdk> {
  const existing = typeform();
  if (existing?.createPopup) return Promise.resolve(existing);
  sdk ??= new Promise<TypeformSdk>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      const tf = typeform();
      if (tf?.createPopup) resolve(tf);
      else reject(new Error(`${src} did not define window.tf`));
    };
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.append(script);
  }).catch((err) => {
    sdk = undefined; // allow a retry
    throw err;
  });
  return sdk;
}

const stylesheets = new Map<string, Promise<void>>();

/**
 * Adds the popup stylesheet to the document once (or reuses one the page already has,
 * e.g. from embed.js's own data-tf-popup initializer).
 */
function loadStylesheet(href: string): Promise<void> {
  const cached = stylesheets.get(href);
  if (cached) return cached;
  const existing = document.querySelector<HTMLLinkElement>(`link[rel="stylesheet"][href="${CSS.escape(href)}"]`);
  const promise = existing?.sheet
    ? Promise.resolve()
    : new Promise<void>((resolve, reject) => {
        const link = existing ?? document.createElement('link');
        link.addEventListener('load', () => resolve(), { once: true });
        link.addEventListener('error', () => reject(new Error(`Could not load ${href}`)), { once: true });
        if (!existing) {
          link.rel = 'stylesheet';
          link.href = href;
          document.head.append(link);
        }
      }).catch((err) => {
        stylesheets.delete(href); // allow a retry
        throw err;
      });
  stylesheets.set(href, promise);
  return promise;
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
  static observedAttributes = ['form-id', 'game-name', 'label', 'medium', 'embed-src', 'embed-css'];

  #hiddenFields: Record<string, string> = {};
  #popup: TypeformPopup | null = null;

  constructor() {
    super();
    // Warm up: start loading the SDK as soon as the user is likely to click.
    const preload = () => this.#formId && this.#loadAssets().catch(() => {});
    this.root.addEventListener('pointerenter', preload, true);
    this.root.addEventListener('focusin', preload);
    this.root.addEventListener('click', (event) => {
      const e = event as MouseEvent;
      if (!(e.target as Element).closest('.button')) return;
      // Modified clicks (new tab / window) keep the plain link behaviour.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      this.track({ event: 'game_interaction', action: 'click', target: 'feedback', position: 'survey' });
      this.open();
    });
  }

  connectedCallback(): void {
    this.upgradeProperty('hiddenFields');
    this.#render();
  }

  disconnectedCallback(): void {
    this.#reset();
  }

  attributeChangedCallback(): void {
    this.#reset();
    if (this.isConnected) this.#render();
  }

  /** Typeform hidden fields, e.g. { difficulty: 'leicht' }. */
  get hiddenFields(): Record<string, string> {
    return this.#hiddenFields;
  }
  set hiddenFields(value: Record<string, string> | null | undefined) {
    this.#hiddenFields = value && typeof value === 'object' ? value : {};
    this.#reset();
    if (this.isConnected) this.#render();
  }

  get #formId(): string {
    return this.getAttribute('form-id') ?? '';
  }

  get #sdkSrc(): string {
    return this.getAttribute('embed-src') || DEFAULT_SDK;
  }

  get #cssHref(): string {
    return this.getAttribute('embed-css') || DEFAULT_CSS;
  }

  /** SDK + popup stylesheet, in parallel. Resolves to window.tf. */
  async #loadAssets(): Promise<TypeformSdk> {
    const [tf] = await Promise.all([loadTypeform(this.#sdkSrc), loadStylesheet(this.#cssHref)]);
    return tf;
  }

  /** Public form URL with hidden fields (Typeform reads them from the hash). */
  get #href(): string {
    const hidden = new URLSearchParams(Object.entries(this.#hiddenFields).map(([k, v]) => [k, String(v)])).toString();
    return `https://form.typeform.com/to/${encodeURIComponent(this.#formId)}${hidden ? `#${hidden}` : ''}`;
  }

  /** Loads the SDK if needed and opens the popup (or the form in a new tab if that fails). */
  async open(): Promise<void> {
    const formId = this.#formId;
    if (!formId) return;
    if (!this.emit('zon-feedback-open', { formId }, { cancelable: true })) return;
    const button = this.root.querySelector('.button');
    button?.setAttribute('aria-busy', 'true');
    try {
      const tf = await this.#loadAssets();
      this.#popup ??= tf.createPopup(formId, {
        medium: this.getAttribute('medium') || 'snippet',
        iframeProps: { title: this.label('game-name', 'Feedback') },
        hidden: this.#hiddenFields,
        onClose: () => this.emit('zon-feedback-close', { formId }),
        onSubmit: ({ responseId }: { responseId?: string } = {}) => this.emit('zon-feedback-submit', { formId, responseId }),
      });
      this.#popup.open();
    } catch (err) {
      // SDK or stylesheet blocked or offline: fall back to the form itself.
      console.warn('<zon-game-feedback-button>:', err);
      window.open(this.#href, '_blank', 'noopener');
    } finally {
      button?.removeAttribute('aria-busy');
    }
  }

  close(): void {
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

declare global {
  interface HTMLElementTagNameMap {
    'zon-game-feedback-button': ZonGameFeedbackButton;
  }
}
