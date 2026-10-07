/**
 * <zon-game-faq>
 *
 * "Häufig gestellte Fragen" accordion. Ported from sudoku's (and wortiger's) static `.faq` block
 * (index*.html + styles.scss) and Wortgeflecht's `FAQSection` + `FAQStructureData`.
 *
 * Unlike the other components this one renders into the LIGHT DOM, with native
 * <details>/<summary>:
 *   - the questions and answers are in the page's HTML, so they are crawlable and
 *     work without JavaScript (open/close, find-in-page, keyboard);
 *   - it is styled by `critical.css`, which the page loads in <head>, so static or
 *     server-rendered FAQs look right before the script runs.
 *
 * Two ways to fill it:
 *
 *   1. Markup (static HTML, server-rendered pages). The component only adds tracking
 *      and, optionally, JSON-LD:
 *        <zon-game-faq>
 *          <details open>
 *            <summary><h2>Wie spielt man Sudoku?</h2></summary>
 *            <p>Ein Sudoku-Rätsel besteht aus …</p>
 *          </details>
 *        </zon-game-faq>
 *
 *   2. Data (Angular / Svelte): set `items` and the component renders the same markup.
 *        <zon-game-faq [items]="faqs" structured-data />
 *
 * Attributes
 *   heading-level     2 (default) – heading level of each question when rendering `items`
 *   exclusive         only one answer open at a time (native <details name>)
 *   structured-data   also write a schema.org FAQPage <script type="application/ld+json">
 *                     (Wortgeflecht does this; for static pages prefer writing it into the HTML)
 *
 * Properties
 *   items  [{ question, answer, open? }]  `answer` is trusted HTML (links, lists, <strong>)
 *
 * Events (bubbles, composed)
 *   zon-faq-toggle { index, question, open }
 *   zon-track      { event: 'game_faq', action: 'open',  target: <question> }
 *                  { event: 'game_faq', action: 'click', target: <link href> }
 *                  (Wortgeflecht's DataTracker.sendGameFaq sends the same, nested in
 *                  event_properties; map it in connectTracking if needed.)
 */
import { define, escapeHtml } from '../shared/base.js';

let missingCssWarned = false;
let instances = 0;

export class ZonGameFaq extends HTMLElement {
  static observedAttributes = ['heading-level', 'exclusive', 'structured-data'];

  #items = null;
  #name = `zon-faq-${++instances}`;

  constructor() {
    super();
    // `toggle` doesn't bubble, so listen in the capture phase.
    this.addEventListener('toggle', (e) => this.#onToggle(e), true);
    this.addEventListener('click', (e) => this.#onClick(e));
  }

  connectedCallback() {
    if (Object.prototype.hasOwnProperty.call(this, 'items')) {
      const value = this.items;
      delete this.items;
      this.items = value;
    }
    this.#update();
    this.#warnWithoutCss();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#update();
  }

  get items() {
    return this.#items ?? this.#readItems();
  }
  set items(value) {
    this.#items = Array.isArray(value) ? value : null;
    if (this.isConnected) this.#update();
  }

  /** The schema.org FAQPage object for the current questions. */
  get structuredData() {
    return faqStructuredData(this.items);
  }

  #update() {
    if (this.#items) this.#render(this.#items);
    const exclusive = this.hasAttribute('exclusive');
    for (const details of this.#details()) {
      if (exclusive) details.name = this.#name;
      else if (details.name === this.#name) details.removeAttribute('name');
    }
    this.#writeStructuredData();
  }

  #render(items) {
    const level = Math.min(6, Math.max(1, Number(this.getAttribute('heading-level')) || 2));
    this.innerHTML = items
      .map(
        (item) => `<details${item.open ? ' open' : ''}>
          <summary><h${level} class="zon-faq__question">${escapeHtml(item.question)}</h${level}></summary>
          <div class="zon-faq__answer">${item.answer ?? ''}</div>
        </details>`,
      )
      .join('');
  }

  #details() {
    return [...this.querySelectorAll(':scope > details')];
  }

  /** Reads questions/answers back from author-written markup. */
  #readItems() {
    return this.#details().map((details) => {
      const summary = details.querySelector(':scope > summary');
      const answer = [...details.childNodes].filter((n) => n !== summary);
      const html = answer
        .map((n) => (n.nodeType === Node.ELEMENT_NODE ? n.outerHTML : n.textContent))
        .join('')
        .trim();
      return { question: summary?.textContent.trim() ?? '', answer: html, open: details.open };
    });
  }

  #writeStructuredData() {
    let script = this.querySelector(':scope > script[data-zon-faq]');
    if (!this.hasAttribute('structured-data')) {
      script?.remove();
      return;
    }
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.zonFaq = '';
      this.append(script);
    }
    script.textContent = JSON.stringify(this.structuredData);
  }

  #onToggle(e) {
    const details = e.target;
    if (!(details instanceof HTMLDetailsElement) || details.parentElement !== this) return;
    const index = this.#details().indexOf(details);
    const question = details.querySelector(':scope > summary')?.textContent.trim() ?? '';
    this.#emit('zon-faq-toggle', { index, question, open: details.open });
    if (details.open) this.#track({ action: 'open', target: question });
  }

  #onClick(e) {
    const link = e.target.closest('a[href]');
    if (!link || !this.contains(link) || link.closest('summary')) return;
    this.#track({ action: 'click', target: link.getAttribute('href') || link.textContent.trim() });
  }

  #emit(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  #track(payload) {
    this.#emit('zon-track', { component: this.localName, event: 'game_faq', ...payload });
  }

  #warnWithoutCss() {
    if (missingCssWarned) return;
    if (getComputedStyle(this).getPropertyValue('--zon-faq-styled').trim()) return;
    missingCssWarned = true;
    console.warn(
      '<zon-game-faq> is unstyled: load @zeitonline/game-components/critical.css in <head>.',
    );
  }
}

/**
 * schema.org FAQPage for a list of questions. Use it to write the JSON-LD into
 * server-rendered or static HTML:
 *   <script type="application/ld+json">${JSON.stringify(faqStructuredData(items))}</script>
 * Google allows basic HTML (links, lists, <strong>, <p>) in the answer text.
 */
export function faqStructuredData(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

define('zon-game-faq', ZonGameFaq);
