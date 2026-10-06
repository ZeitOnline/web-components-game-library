/**
 * <zon-game-dialog>
 *
 * Replaces Wortgeflecht's `Dialog.svelte` + `DialogManager` and the Angular
 * `zonspiele-overlay` + `OverlayService`. It is built on the native <dialog> element,
 * which gives top-layer rendering, inert background and a focus trap for free.
 * The Angular overlay needs CDK `cdkTrapFocus` for the same thing.
 *
 * Attributes
 *   open        reflects state; set/remove it to open/close
 *   variant     default | wide | drawer | fullscreen
 *               drawer = bottom sheet below 768px; fullscreen = paywall layout
 *   persistent  Esc / backdrop click do not close the dialog (paywall); also hides
 *               the close button unless `closable` is set
 *   closable    keep the close button on a persistent dialog
 *   label       accessible name, if no slot="title" content is given
 *   close-label aria-label of the close button (default "Dialog schließen")
 *
 * Slots
 *   title       heading; focused on open, used as accessible name
 *   (default)   content
 *   footer      sticky actions
 *
 * Events (bubbles, composed)
 *   zon-open                       after the dialog opened
 *   zon-close   { reason }         reason: button | escape | backdrop | api
 *   zon-track   { event: 'game_interaction', action: 'open'|'close', target }
 *
 * Methods
 *   show(), close(reason = 'api')
 */
import { ZonElement, css, define } from '../shared/base.js';
import { icons } from '../shared/icons.js';

let scrollLocks = 0;
function lockScroll(lock) {
  scrollLocks = Math.max(0, scrollLocks + (lock ? 1 : -1));
  document.documentElement.style.overflow = scrollLocks ? 'hidden' : '';
}

function deepActiveElement() {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el;
}

const sheet = css`
:host { display: contents; }

dialog {
  --_max-width: 26rem;
  margin: auto;
  padding: 0;
  border: 0;
  width: min(var(--zon-dialog-max-width, var(--_max-width)), calc(100% - 2em));
  max-height: calc(100dvh - 2em);
  overflow: auto;
  overscroll-behavior: contain;
  background: var(--zon-dialog-bg, var(--_bg-modal));
  color: inherit;
  border-radius: var(--_radius-12);
  box-shadow: var(--_shadow);
  opacity: 0;
  scale: 0.96;
  transition: opacity 0.2s ease, scale 0.2s ease, translate 0.25s ease,
    overlay 0.2s allow-discrete, display 0.2s allow-discrete;
}
dialog[open] { opacity: 1; scale: 1; }
@starting-style { dialog[open] { opacity: 0; scale: 0.96; } }

dialog::backdrop {
  background: var(--_black-40);
  opacity: 0;
  transition: opacity 0.2s ease, overlay 0.2s allow-discrete, display 0.2s allow-discrete;
}
dialog[open]::backdrop { opacity: 1; }
@starting-style { dialog[open]::backdrop { opacity: 0; } }

:host([variant='wide']) dialog { --_max-width: 568px; }

/* Bottom sheet on mobile, like the Angular overlay's slide-up animation. */
@media (max-width: 767px) {
  :host([variant='drawer']) dialog {
    width: 100%;
    max-width: 100%;
    margin: auto 0 0;
    border-radius: var(--_radius-12) var(--_radius-12) 0 0;
    scale: 1;
    translate: 0 100%;
    padding-bottom: env(safe-area-inset-bottom);
  }
  :host([variant='drawer']) dialog[open] { translate: 0 0; }
  @starting-style { :host([variant='drawer']) dialog[open] { translate: 0 100%; } }

  :host([variant='fullscreen']) dialog {
    width: 100%;
    max-width: 100%;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
    padding-top: env(safe-area-inset-top);
  }
}

.inner {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--_space-m);
  padding: var(--_space-l) var(--_space-m) var(--_space-m);
}
.close {
  position: absolute;
  top: var(--_space-s);
  right: var(--_space-s);
}
:host([persistent]:not([closable])) .close { display: none; }

.title {
  margin: 0 var(--_space-xl);
  text-align: center;
  font-weight: 700;
  font-size: var(--_fs-20);
}
.title:focus { outline: none; }

.footer { display: flex; flex-direction: column; gap: var(--_space-s); }
`;

export class ZonGameDialog extends ZonElement {
  static sheet = sheet;
  static observedAttributes = ['open', 'label', 'close-label'];

  #dialog;
  #title;
  #titleSlot;
  #opener = null;
  #closeReason = 'api';

  constructor() {
    super();
    this.root.innerHTML = `
      <dialog part="dialog" aria-labelledby="title">
        <div class="inner" part="inner">
          <button class="zon-button zon-button--icon close" part="close-button" type="button">${icons.close(18)}</button>
          <div class="title" id="title" part="title" tabindex="-1"><slot name="title"></slot></div>
          <div class="content" part="content"><slot></slot></div>
          <div class="footer" part="footer"><slot name="footer"></slot></div>
        </div>
      </dialog>`;
    this.#dialog = this.root.querySelector('dialog');
    this.#title = this.root.querySelector('.title');
    this.#titleSlot = this.root.querySelector('slot[name="title"]');

    // Hide empty title / footer wrappers so they don't add gaps.
    for (const slot of this.root.querySelectorAll('slot[name]')) {
      const sync = () => (slot.parentElement.hidden = slot.assignedNodes().length === 0);
      slot.addEventListener('slotchange', sync);
      sync();
    }

    this.root.querySelector('.close').addEventListener('click', () => this.close('button'));

    // Esc: native `cancel` event. Prevent it for persistent dialogs.
    this.#dialog.addEventListener('cancel', (e) => {
      if (this.hasAttribute('persistent')) {
        e.preventDefault();
        return;
      }
      this.#closeReason = 'escape';
    });

    // Backdrop click: the click target is the <dialog> itself (padding is 0,
    // .inner covers the whole box), so anything else is a click on content.
    this.#dialog.addEventListener('click', (e) => {
      if (e.target === this.#dialog && !this.hasAttribute('persistent')) this.close('backdrop');
    });

    this.#dialog.addEventListener('close', () => this.#afterClose());
  }

  connectedCallback() {
    this.#syncLabels();
    if (this.hasAttribute('open') && !this.#dialog.open) this.#open();
  }

  disconnectedCallback() {
    if (this.#dialog.open) {
      this.#dialog.close();
      lockScroll(false);
    }
  }

  attributeChangedCallback(name) {
    if (name === 'open') {
      const want = this.hasAttribute('open');
      if (want && !this.#dialog.open && this.isConnected) this.#open();
      if (!want && this.#dialog.open) this.#dialog.close();
      return;
    }
    this.#syncLabels();
  }

  get open() {
    return this.hasAttribute('open');
  }
  set open(value) {
    this.toggleAttribute('open', Boolean(value));
  }

  show() {
    this.open = true;
  }

  close(reason = 'api') {
    this.#closeReason = reason;
    this.open = false;
  }

  #syncLabels() {
    const close = this.root.querySelector('.close');
    close.setAttribute('aria-label', this.label('close-label', 'Dialog schließen'));
    const label = this.getAttribute('label');
    if (label) {
      this.#dialog.setAttribute('aria-label', label);
      this.#dialog.removeAttribute('aria-labelledby');
    } else {
      this.#dialog.removeAttribute('aria-label');
      this.#dialog.setAttribute('aria-labelledby', 'title');
    }
  }

  #open() {
    this.#opener = deepActiveElement();
    this.#closeReason = 'api';
    this.#dialog.showModal();
    lockScroll(true);

    // Like Wortgeflecht: move focus to the heading so screen readers announce it.
    if (this.#titleSlot.assignedNodes().length) this.#title.focus();

    this.emit('zon-open');
    this.track({ event: 'game_interaction', action: 'open', target: this.id || this.localName });
  }

  #afterClose() {
    lockScroll(false);
    // Keep the attribute in sync when the native dialog closed itself (Esc).
    if (this.hasAttribute('open')) this.removeAttribute('open');

    const reason = this.#closeReason;
    this.#closeReason = 'api';
    if (this.#opener?.isConnected) this.#opener.focus();
    this.#opener = null;

    this.emit('zon-close', { reason });
    this.track({ event: 'game_interaction', action: 'close', target: this.id || this.localName, reason });
  }
}

define('zon-game-dialog', ZonGameDialog);
