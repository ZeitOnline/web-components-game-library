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

export interface EmitOptions {
  cancelable?: boolean;
}

export class ZonElement extends HTMLElement {
  /** Component-specific CSSStyleSheet, set by subclasses. */
  static sheet: CSSStyleSheet | null = null;
  /** Extra attachShadow() options, e.g. { delegatesFocus: true }. */
  static shadowOptions: Partial<Omit<ShadowRootInit, 'mode'>> = {};

  /** The component's shadow root. */
  readonly root: ShadowRoot;

  constructor() {
    super();
    const ctor = this.constructor as typeof ZonElement;
    // Re-use a declarative shadow root if the server rendered one (SSR).
    this.root = this.shadowRoot ?? this.attachShadow({ mode: 'open', ...ctor.shadowOptions });
    const sheets = [baseSheet];
    if (ctor.sheet) sheets.push(ctor.sheet);
    this.root.adoptedStyleSheets = sheets;
  }

  /**
   * Frameworks may set properties before the element is upgraded (e.g. when the
   * script loads lazily). Re-apply them through the class setter.
   */
  protected upgradeProperty(name: string): void {
    upgradeProperty(this, name);
  }

  protected emit(name: string, detail: object = {}, { cancelable = false }: EmitOptions = {}): boolean {
    const event = new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable });
    return this.dispatchEvent(event);
  }

  /** Emits an analytics intent. Payload mirrors the existing dataLayer schema. */
  protected track(payload: Record<string, unknown>): void {
    this.emit('zon-track', { component: this.localName, ...payload });
  }

  /** Reads a label attribute with a German default (no i18n in the games yet). */
  protected label(name: string, fallback: string): string {
    return this.getAttribute(name) ?? fallback;
  }
}

/** See ZonElement#upgradeProperty; also used by the light-DOM <zon-game-faq>. */
export function upgradeProperty(element: HTMLElement, name: string): void {
  if (Object.prototype.hasOwnProperty.call(element, name)) {
    const value: unknown = Reflect.get(element, name);
    Reflect.deleteProperty(element, name);
    Reflect.set(element, name, value);
  }
}

export function define(tag: string, ctor: CustomElementConstructor): void {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}

export function css(strings: TemplateStringsArray, ...values: unknown[]): CSSStyleSheet {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(String.raw(strings, ...values));
  return sheet;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

const dateFormat = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'short' });

/** "2026-10-06" → "Dienstag, 6. Okt." (same as Angular `date: 'EEEE, d. MMM'` in de). */
export function formatGameDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : dateFormat.format(date);
}
