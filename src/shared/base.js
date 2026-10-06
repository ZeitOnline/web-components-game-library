/**
 * Base class for all ZON game web components.
 *
 * - Open shadow root with shared constructable stylesheets (parsed once per page,
 *   not once per instance).
 * - `emit()` dispatches bubbling + composed CustomEvents so hosts (Angular, Svelte,
 *   plain JS) can listen on the element or anywhere above it.
 * - `track()` emits a `zon-track` event instead of calling `window.dataLayer`
 *   directly. The host decides how/if it forwards it (see docs/PLAN.md).
 */
import { baseSheet } from './styles.js';

export class ZonElement extends HTMLElement {
  /** Component-specific CSSStyleSheet, set by subclasses. */
  static sheet = null;

  constructor() {
    super();
    // Re-use a declarative shadow root if the server rendered one (SSR).
    this.root = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const sheets = [baseSheet];
    if (this.constructor.sheet) sheets.push(this.constructor.sheet);
    this.root.adoptedStyleSheets = sheets;
  }

  /**
   * Frameworks may set properties before the element is upgraded (e.g. when the
   * script loads lazily). Re-apply them through the class setter.
   */
  upgradeProperty(name) {
    if (Object.prototype.hasOwnProperty.call(this, name)) {
      const value = this[name];
      delete this[name];
      this[name] = value;
    }
  }

  emit(name, detail = {}, { cancelable = false } = {}) {
    const event = new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable });
    return this.dispatchEvent(event);
  }

  /** Emits an analytics intent. Payload mirrors the existing dataLayer schema. */
  track(payload) {
    this.emit('zon-track', { component: this.localName, ...payload });
  }

  /** Reads a label attribute with a German default (no i18n in the games yet). */
  label(name, fallback) {
    return this.getAttribute(name) ?? fallback;
  }
}

export function define(tag, ctor) {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}

export function css(strings, ...values) {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(String.raw(strings, ...values));
  return sheet;
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

const dateFormat = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'short' });

/** "2026-10-06" → "Dienstag, 6. Okt." (same as Angular `date: 'EEEE, d. MMM'` in de). */
export function formatGameDate(value) {
  if (!value) return '';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : dateFormat.format(date);
}
