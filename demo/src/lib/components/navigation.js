const printIcon =
  '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><rect x="6" y="14" width="12" height="7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/></svg>';

/** @type {import('./types').ComponentDef} */
export default {
  slug: 'navigation',
  tag: 'zon-game-navigation',
  name: 'Navigation',
  category: 'Game screen',
  attributes: [
    { name: 'heading', type: 'text', description: 'Title in the middle (or slot="title").' },
    { name: 'heading-level', type: 'enum', options: [null, '1', '2'], description: 'Renders the title as h1–h6. Default: plain div, as in sudoku.' },
    { name: 'start-actions', type: 'enum', options: ['back archive', 'back', ''], default: 'back archive', description: 'Space-separated built-in actions on the left.' },
    { name: 'end-actions', type: 'enum', options: ['theme more', 'hint more', 'more', ''], default: 'theme more', description: 'Space-separated built-in actions on the right.' },
    { name: 'disabled-actions', type: 'text', description: 'Space-separated actions to disable, e.g. “hint”.' },
    { name: 'back-href', type: 'text', description: 'Makes “back” a real link (works without JS).' },
    { name: '<action>-dialog', type: 'text', control: false, description: 'Id of a <code>&lt;zon-game-dialog&gt;</code> to open, e.g. <code>archive-dialog="archive"</code>. aria-expanded follows it.' },
    { name: '<action>-label', type: 'text', control: false, description: 'Overrides an aria-label, e.g. <code>more-label="Menü"</code>.' },
  ],
  properties: [
    { name: 'handlers', type: 'Record<action, (ctx) => unknown>', description: 'Plain callbacks per action. Return <code>false</code> to skip the default action.' },
    { name: 'customActions', type: '{ id, label, icon?, position?, disabled?, haspopup?, onClick? }[]', description: 'Extra buttons. <code>onClick</code> gets the same context as handlers and also fires zon-nav.' },
  ],
  methods: [
    { name: 'setExpanded(action, bool)', description: 'aria-expanded for menus not wired via <action>-dialog.' },
    { name: 'setDisabled(action, bool)', description: 'Updates disabled-actions.' },
  ],
  events: [
    { name: 'zon-nav', detail: "{ action, source: 'builtin' | 'custom' }", cancelable: true, description: 'Any button. preventDefault() skips the default action. Order: handler / onClick → zon-nav → default.' },
    { name: 'zon-theme-change', detail: "{ scheme: 'dark' | 'light' }", description: 'After the theme switch toggled html.color-scheme-dark / -light.' },
  ],
  slots: [
    { name: 'title', description: 'Rich title instead of heading.' },
    { name: 'start', description: 'Extra elements appended to the left group.' },
    { name: 'end', description: 'Extra elements appended to the right group.' },
  ],
  parts: [
    { name: 'bar', description: 'The header bar.' },
    { name: 'title', description: 'Centred title.' },
  ],
  cssProps: [],
  tracking: [{ when: 'Any button', payload: "{ event: 'game_interaction', action: 'click', target: <action>, position: 'ingame' }" }],
  playground: {
    values: { heading: 'Sudoku Leicht', 'heading-level': null, 'start-actions': 'back archive', 'end-actions': 'theme more', 'disabled-actions': '', 'back-href': '#playground' },
    props: {
      customActions: [{ id: 'print', label: 'Rätsel drucken', position: 'end', icon: printIcon, onClick: () => {} }],
    },
    propsCode: {
      customActions: "[{ id: 'print', label: 'Rätsel drucken', position: 'end', icon: printSvg, onClick: () => print() }]",
    },
    layout: 'fill',
    actions: [
      { label: "setDisabled('hint', true)", run: (el) => el.setDisabled('hint', true) },
      { label: "setDisabled('hint', false)", run: (el) => el.setDisabled('hint', false) },
    ],
  },
  cardZoom: 0.6,
};
