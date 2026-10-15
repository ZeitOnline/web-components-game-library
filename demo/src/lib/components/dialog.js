/** @type {import('./types').ComponentDef} */
export default {
  slug: 'dialog',
  tag: 'zon-game-dialog',
  name: 'Dialog',
  category: 'Overlays',
  summary:
    'Modal, bottom sheet or fullscreen overlay on the native <dialog> element: top layer, inert background and focus trap come for free.',
  replaces: [
    'Wortgeflecht <code>Dialog.svelte</code> + <code>DialogManager</code>',
    'Angular <code>zonspiele-overlay</code> + <code>OverlayService</code> (CDK focus trap)',
  ],
  attributes: [
    { name: 'variant', type: 'enum', options: ['default', 'wide', 'drawer', 'fullscreen'], default: 'default', description: '<code>drawer</code> is a bottom sheet below 768px, <code>fullscreen</code> the paywall layout.' },
    { name: 'open', type: 'boolean', description: 'Reflects the state. Set or remove it to open or close.' },
    { name: 'persistent', type: 'boolean', description: 'Esc and backdrop clicks do not close it (paywall). Also hides the close button unless <code>closable</code> is set.' },
    { name: 'closable', type: 'boolean', description: 'Keeps the close button on a persistent dialog.' },
    { name: 'label', type: 'text', description: 'Accessible name when there is no <code>slot="title"</code> content.' },
    { name: 'close-label', type: 'text', default: 'Dialog schließen', description: 'aria-label of the close button.' },
  ],
  properties: [{ name: 'open', type: 'boolean', description: 'Same as the attribute.' }],
  methods: [
    { name: 'show()', description: 'Opens the dialog; focus moves to the title.' },
    { name: "close(reason = 'api')", description: 'Closes it; focus returns to the element that opened it.' },
  ],
  events: [
    { name: 'zon-open', detail: '{}', description: 'After the dialog opened.' },
    { name: 'zon-close', detail: '{ reason }', description: '<code>reason</code>: button · escape · backdrop · api (or what was passed to <code>close()</code>).' },
  ],
  slots: [
    { name: 'title', description: 'Heading. Focused on open and used as the accessible name.' },
    { name: '', description: 'Content.' },
    { name: 'footer', description: 'Actions below the content.' },
  ],
  parts: [
    { name: 'dialog', description: 'The native <dialog>.' },
    { name: 'inner', description: 'Padding box.' },
    { name: 'close-button', description: 'Round close button, top right.' },
    { name: 'title', description: 'Wrapper of the title slot.' },
    { name: 'content', description: 'Wrapper of the default slot.' },
    { name: 'footer', description: 'Wrapper of the footer slot.' },
  ],
  cssProps: [
    { name: '--zon-dialog-max-width', description: 'Maximum width (default 26rem, wide 568px).' },
    { name: '--zon-dialog-bg', description: 'Background (default: background-modal token).' },
  ],
  a11y: [
    { topic: 'Role', text: 'Native modal <dialog>: the rest of the page is inert while it is open.' },
    { topic: 'Name', text: 'aria-labelledby points at the title slot; without a title, set label.' },
    { topic: 'Focus', text: 'Moves to the title on open (screen readers announce it) and back to the opener on close.' },
    { topic: 'Keyboard', text: 'Esc closes, unless persistent. Tab stays inside the dialog.' },
    { topic: 'Scroll', text: 'The page behind is scroll-locked; nested dialogs are counted.' },
  ],
  tracking: [
    { when: 'Opened', payload: "{ event: 'game_interaction', action: 'open', target: <id> }" },
    { when: 'Closed', payload: "{ event: 'game_interaction', action: 'close', target: <id>, reason }" },
  ],
  usage: {
    when: [
      'Rules, archive, “Mehr” menu and the paywall: anything that interrupts the game.',
      '<code>drawer</code> for menus and lists on mobile, <code>wide</code> for the rules stepper.',
    ],
    whenNot: ['Short confirmations that do not need focus (use a toast / live region).', 'Navigation to a different page.'],
    faq: [
      { q: 'Why does my slotted heading look different?', a: 'Slotted content is light DOM: the page styles it. A global <code>h2 { text-transform: uppercase }</code> also hits <code>&lt;h2 slot="title"&gt;</code>. Style slotted content in the game.' },
      { q: 'How do I open it from <zon-game-navigation>?', a: 'Give the dialog an id and set <code>archive-dialog="&lt;id&gt;"</code> or <code>more-dialog="&lt;id&gt;"</code> on the navigation. aria-expanded is kept in sync automatically.' },
      { q: 'Can I stack dialogs?', a: 'Yes. Each one is a top-layer element; the scroll lock counts open dialogs.' },
    ],
  },
  playground: {
    values: { variant: 'default', open: false, persistent: false, closable: false, label: '', 'close-label': '' },
    html: '<h2 slot="title">Mehr</h2>\n<p>Game content, e.g. the list of games from more-screen.</p>\n<button slot="footer" type="button">Spielregeln</button>',
    note: 'The dialog renders in the browser’s top layer, not on this stage. Open it with show() or the open switch.',
    actions: [
      { label: 'show()', run: (el) => el.show() },
      { label: 'close()', run: (el) => el.close() },
    ],
  },
  anatomy: false,
  card: '<div class="mock-dialog"><span class="mock-dialog__close">×</span><strong>Mehr</strong><span>Game content</span><span class="mock-dialog__btn"></span></div>',
};
