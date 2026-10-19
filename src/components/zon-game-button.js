/**
 * <zon-game-button>
 *
 * The button the games share. Its copies are sudoku's `commons/styles/button.scss` mixins
 * (button, dsButton, buttonPrimary/-Secondary/-Premium, dsTextButton, iconButton) and
 * Wortgeflecht's `Button.svelte` + `lib/styles/button.css`. The styles live in
 * shared/styles.js (`.zon-button`), so the buttons inside the other components match it.
 *
 * Renders a real <button>, or an <a> when `href` is set. Use it for content you put into
 * the components (e.g. a dialog's footer slot) and anywhere else in a game.
 *
 * Attributes
 *   variant    primary (default) | secondary | outline | text | premium | icon
 *              icon = the round button of the game navigation (43px; 32px when small)
 *   size       default (40px, 16px) | small (32px, 14px, as Wortgeflecht)
 *   icon       a ready-made icon: back | archive | more | hint | sun | moon | close | play |
 *              pause | share | print. Leading icon, or the content of variant="icon"; then the
 *              text inside becomes the (visually hidden) accessible name.
 *   href       renders a link; `target` is passed on (rel="noopener" for _blank)
 *   type       button (default) | submit | reset — works inside a <form> (form-associated)
 *   disabled   not clickable; a disabled link loses its href
 *   label      accessible name; for variant="icon" without text inside
 *
 * Slots
 *   (default)  label (with variant="icon" and `icon`: the hidden accessible name), or a
 *              custom svg for variant="icon"
 *   icon       custom leading icon (svg), instead of the `icon` attribute
 *
 * Parts
 *   button     the inner <button> / <a>
 *
 * Events
 *   Native `click` (retargeted to the element). Disabled buttons don't fire it.
 */
import { ZonElement, css, define, escapeHtml } from '../shared/base.js';
import { iconTemplates } from '../shared/icons.js';

const VARIANTS = ['primary', 'secondary', 'outline', 'text', 'premium', 'icon'];

const sheet = css`
:host { display: inline-flex; vertical-align: middle; }
/* Fills its host, so a stretched host (e.g. in a column flex container) gives a full-width button.
   The round icon button keeps its circle. */
.zon-button { flex: 1 1 auto; }
.zon-button.zon-button--icon { flex: none; }
::slotted(svg), slot[name='icon']::slotted(*) { flex-shrink: 0; }
`;

export class ZonGameButton extends ZonElement {
  static sheet = sheet;
  static shadowOptions = { delegatesFocus: true };
  static formAssociated = true;
  static observedAttributes = ['variant', 'size', 'icon', 'href', 'target', 'type', 'disabled', 'label'];

  #internals = this.attachInternals?.();

  constructor() {
    super();
    // Shadow-DOM buttons don't submit a surrounding form by themselves.
    this.root.addEventListener('click', (e) => {
      if (this.hasAttribute('disabled')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const form = this.#internals?.form;
      if (!form || this.hasAttribute('href')) return;
      const type = this.getAttribute('type');
      if (type === 'submit') form.requestSubmit();
      else if (type === 'reset') form.reset();
    });
  }

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  #render() {
    const variant = VARIANTS.includes(this.getAttribute('variant')) ? this.getAttribute('variant') : 'primary';
    const classes = ['zon-button'];
    if (variant !== 'primary') classes.push(`zon-button--${variant}`);
    if (this.getAttribute('size') === 'small') classes.push('zon-button--small');
    const disabled = this.hasAttribute('disabled');
    const label = this.getAttribute('label');
    const aria = label ? ` aria-label="${escapeHtml(label)}"` : '';
    const icon = iconTemplates[this.getAttribute('icon')] ?? '';
    // Round button with a ready-made icon: the text inside is its accessible name, not visible.
    const text = variant === 'icon' && icon ? '<span class="sr-only"><slot></slot></span>' : '<slot></slot>';
    const content = `${icon}<slot name="icon"></slot>${text}`;
    const href = this.getAttribute('href');

    if (href !== null) {
      const target = this.getAttribute('target');
      const link = disabled
        ? ` role="link" aria-disabled="true"`
        : ` href="${escapeHtml(href)}"${target ? ` target="${escapeHtml(target)}"` : ''}${target === '_blank' ? ' rel="noopener"' : ''}`;
      this.root.innerHTML = `<a class="${classes.join(' ')}" part="button"${link}${aria}>${content}</a>`;
    } else {
      this.root.innerHTML = `<button class="${classes.join(' ')}" part="button" type="button"${disabled ? ' disabled' : ''}${aria}>${content}</button>`;
    }
  }
}

define('zon-game-button', ZonGameButton);
