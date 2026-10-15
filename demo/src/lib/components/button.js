/** @type {import('./types').ComponentDef} */
export default {
  slug: 'button',
  tag: 'zon-game-button',
  name: 'Button',
  category: 'Basics',
  attributes: [
    { name: 'variant', type: 'enum', options: ['primary', 'secondary', 'outline', 'text', 'premium', 'icon'], default: 'primary', description: '<code>premium</code> is the Z+ red; <code>icon</code> is the round button of the game navigation (43px, 32px when small).' },
    { name: 'icon', type: 'enum', options: [null, 'back', 'archive', 'more', 'hint', 'sun', 'moon', 'close', 'play', 'pause', 'share', 'print'], description: 'Ready-made icon (the game navigation’s set). With <code>variant="icon"</code> the text inside becomes the hidden accessible name.' },
    { name: 'size', type: 'enum', options: [null, 'small'], description: 'Default 40px / 16px (sudoku), <code>small</code> 32px / 14px (Wortgeflecht).' },
    { name: 'disabled', type: 'boolean', description: 'Not clickable, 40 % opacity. A disabled link loses its href.' },
    { name: 'href', type: 'text', description: 'Renders an <code>&lt;a&gt;</code>: use it for navigation, a button for actions.' },
    { name: 'target', type: 'text', description: 'Link target; <code>_blank</code> adds rel="noopener".' },
    { name: 'type', type: 'enum', options: [null, 'submit', 'reset'], description: 'Inside a <code>&lt;form&gt;</code>: submits or resets it (form-associated element).' },
    { name: 'label', type: 'text', placeholder: 'screen readers only (aria-label)', description: 'Accessible name for screen readers (aria-label), not shown. Only needed when there is no text inside, e.g. a round button with a custom svg. The visible text is the content between the tags.' },
  ],
  properties: [],
  methods: [],
  events: [{ name: 'click', detail: '—', description: 'The native click, retargeted to the element. Not fired when disabled.' }],
  slots: [
    { name: '', description: 'Label (or the icon for <code>variant="icon"</code>).' },
    { name: 'icon', description: 'Custom leading icon (svg), instead of the <code>icon</code> attribute.' },
  ],
  parts: [{ name: 'button', description: 'The inner <button> or <a>.' }],
  cssProps: [],
  tracking: [],
  playground: {
    values: { variant: 'primary', icon: 'play', size: null, disabled: false, href: '', target: '', type: null, label: '' },
    html: 'Rätsel starten',
    text: true,
    actions: [{ label: 'focus()', run: (el) => el.focus() }],
  },
};
