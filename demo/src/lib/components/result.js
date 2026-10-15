/** @type {import('./types').ComponentDef} */
export default {
  slug: 'result',
  tag: 'zon-game-result',
  name: 'Result',
  category: 'Game screen',
  summary: 'End-of-game screen: icon, heading, summary, stats, share and next / replay. Game-specific widgets are slotted in.',
  replaces: [
    'sudoku / wortiger <code>closure-screen-metered</code> + <code>statistic</code>',
    'Wortgeflecht <code>GameEndScreen.svelte</code>',
  ],
  attributes: [
    { name: 'heading', type: 'text', default: 'Gut gemacht!', description: 'Heading.' },
    { name: 'primary-label', type: 'text', default: 'Zum nächsten Rätsel', description: 'Primary button. An empty string hides it.' },
    { name: 'secondary-label', type: 'text', default: 'Erneut spielen', description: 'Secondary button. An empty string hides it.' },
    { name: 'share-text', type: 'text', description: 'Enables the share button; text for navigator.share or the clipboard.' },
    { name: 'share-url', type: 'text', description: 'Optional URL for sharing.' },
    { name: 'share-label', type: 'text', default: 'Ergebnis teilen', description: 'Share button.' },
    { name: 'copied-label', type: 'text', default: 'In die Zwischenablage kopiert', description: 'Status after copying.' },
  ],
  properties: [{ name: 'stats', type: '{ label, value, record?, badge? }[]', description: 'Stat tiles. <code>record</code> shows a “Rekord” badge, <code>badge</code> a custom one.' }],
  methods: [{ name: 'share()', description: 'Native share on touch devices, clipboard elsewhere.' }],
  events: [
    { name: 'zon-primary', detail: '{}', description: 'Primary button.' },
    { name: 'zon-secondary', detail: '{}', description: 'Secondary button.' },
    { name: 'zon-share', detail: '{ method }', description: '<code>method</code>: native · clipboard · cancelled · failed.' },
  ],
  slots: [
    { name: 'icon', description: 'Replaces the party icon tile.' },
    { name: 'summary', description: 'E.g. “In <strong>04:12</strong> gelöst”.' },
    { name: '', description: 'Extra sections: highscore, voucher, teasers, solution list.' },
  ],
  parts: [
    { name: 'wrap', description: 'The section.' },
    { name: 'icon', description: 'Tilted icon tile.' },
    { name: 'heading', description: 'h2.' },
    { name: 'summary', description: 'Summary slot wrapper.' },
    { name: 'stats', description: 'Stats grid (dl).' },
    { name: 'stat', description: 'One tile.' },
    { name: 'actions', description: 'Buttons.' },
  ],
  cssProps: [{ name: '--zon-result-max-width', description: 'Maximum width (default 660px).' }],
  a11y: [
    { topic: 'Landmark', text: 'A <section> labelled by its heading.' },
    { topic: 'Stats', text: 'A description list: label (dt) and value (dd).' },
    { topic: 'Status', text: '“Kopiert” is announced through a polite live region.' },
  ],
  tracking: [{ when: 'Button click', payload: "{ event: 'game_interaction', action: 'click', target: 'next' | 'replay' | 'share', position: 'closure_screen' }" }],
  usage: {
    when: ['After a puzzle is solved or failed.'],
    whenNot: ['Intermediate progress inside the game.'],
    faq: [
      { q: 'How do I show a fail state?', a: 'Set <code>heading</code>, swap the icon via <code>slot="icon"</code> and put the solution list into the default slot.' },
      { q: 'Why does stats have to be a property?', a: 'It is structured data. Angular: <code>[stats]="stats"</code>, Svelte: <code>stats={stats}</code>.' },
    ],
  },
  playground: {
    values: { heading: '', 'primary-label': '', 'secondary-label': '', 'share-text': 'ZEIT Sudoku 15.10. ✅ 04:12', 'share-label': '' },
    html: '<p slot="summary">In <strong>04:12</strong> gelöst – schneller als 72 % der Spieler:innen.</p>',
    props: {
      stats: [
        { label: 'Zeit', value: '04:12', record: true },
        { label: 'Gelöst', value: 37 },
        { label: 'Serie', value: '5 Tage' },
      ],
    },
    layout: 'fill',
  },
  cardZoom: 0.45,
};
