/** @type {import('./types').ComponentDef} */
export default {
  slug: 'dialog',
  tag: 'zon-game-dialog',
  name: 'Dialog',
  category: 'Overlays',
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
  tracking: [
    { when: 'Opened', payload: "{ event: 'game_interaction', action: 'open', target: <id> }" },
    { when: 'Closed', payload: "{ event: 'game_interaction', action: 'close', target: <id>, reason }" },
  ],
  playground: {
    values: { variant: 'default', open: false, persistent: false, closable: false, label: '', 'close-label': '' },
    html: '<h2 slot="title">Mehr</h2>\n<p>Game content, e.g. the list of games from more-screen.</p>\n<zon-game-button slot="footer">Spielregeln</zon-game-button>',
    imports: ['@zeitonline/game-components/button'],
    note: 'The dialog renders in the browser’s top layer, not on this stage. Open it with show() or the open switch.',
    actions: [
      { label: 'show()', run: (el) => el.show() },
      { label: 'close()', run: (el) => el.close() },
    ],
  },
  anatomy: false,
  card: '<div class="mock-dialog"><span class="mock-dialog__close">×</span><strong>Mehr</strong><span>Game content</span><span class="mock-dialog__btn"></span></div>',
};
