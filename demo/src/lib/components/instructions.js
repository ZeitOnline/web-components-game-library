const steps = [
  {
    title: 'Ziel des Spiels',
    description: 'Füllen Sie das Raster so, dass jede Zeile, Spalte und jedes Feld die Zahlen <strong>1 bis 9</strong> genau einmal enthält.',
    svg: "<svg viewBox='0 0 90 90' width='160'><rect x='1' y='1' width='88' height='88' fill='none' stroke='currentColor' stroke-width='2'/><path d='M31 1v88M61 1v88M1 31h88M1 61h88' stroke='currentColor'/></svg>",
  },
  { title: 'Notizen', description: 'Mit dem Stift-Symbol können Sie Kandidaten notieren.' },
  { title: 'Tipps', description: 'Wenn Sie nicht weiterkommen, hilft ein Tipp.', descriptionTwo: 'Tipps beeinflussen Ihre Statistik nicht.' },
];

/** @type {import('./types').ComponentDef} */
export default {
  slug: 'instructions',
  tag: 'zon-game-instructions',
  name: 'Instructions',
  category: 'Overlays',
  summary: 'The “So wird gespielt” stepper: slides with text and artwork, progress dots, skip and start. Usually placed inside a wide dialog.',
  replaces: [
    'Wortgeflecht <code>InstructionsDialog.svelte</code>',
    'sudoku <code>game/instructions</code>',
    'wortiger <code>components/instructions</code>',
  ],
  attributes: [
    { name: 'step', type: 'enum', options: ['0', '1', '2'], default: '0', description: 'Current step, 0-based. Reflects.' },
    { name: 'next-label', type: 'text', default: 'Weiter', description: 'Next button.' },
    { name: 'prev-label', type: 'text', default: 'Vorheriger Schritt', description: 'Back link above the slide.' },
    { name: 'skip-label', type: 'text', default: 'Tutorial überspringen', description: 'Skip link.' },
    { name: 'start-label', type: 'text', default: 'Rätsel starten', description: 'Button on the last step.' },
    { name: 'restart-label', type: 'text', default: 'Tutorial erneut ansehen', description: 'Link on the last step.' },
  ],
  properties: [
    { name: 'steps', type: '{ title, description?, descriptionTwo?, svg?, image?, imageAlt? }[]', description: 'Slides. <code>description</code>, <code>descriptionTwo</code> and <code>svg</code> are trusted HTML from the game repo. Alternatively a child <code>&lt;script type="application/json"&gt;</code>.' },
    { name: 'step', type: 'number', description: 'Same as the attribute.' },
  ],
  methods: [{ name: 'goTo(step)', description: 'Go to a step; emits zon-step-change and tracking.' }],
  events: [
    { name: 'zon-step-change', detail: '{ step, previous, direction }', description: 'After the slide changed.' },
    { name: 'zon-complete', detail: '{ step }', cancelable: true, description: '“Rätsel starten”. Default action closes the parent dialog.' },
    { name: 'zon-skip', detail: '{ step }', cancelable: true, description: '“Tutorial überspringen”. Default action closes the parent dialog.' },
  ],
  slots: [{ name: '', description: 'Fallback content while there are no steps.' }],
  parts: [
    { name: 'slide', description: 'Current slide (live region).' },
    { name: 'slide-title', description: 'Slide heading (h3).' },
    { name: 'actions', description: 'Next / start and skip / restart.' },
  ],
  cssProps: [],
  a11y: [
    { topic: 'Live region', text: 'The slide is aria-live="polite" and labelled “Schritt n von m”.' },
    { topic: 'Progress', text: 'Dots are buttons; the current one has aria-current="step".' },
    { topic: 'Focus', text: 'Re-rendering keeps keyboard focus on the equivalent control.' },
    { topic: 'Artwork', text: 'Inline SVG is aria-hidden; images use imageAlt.' },
  ],
  tracking: [
    { when: 'Step change', payload: "{ event: 'game_rules', action: 'forward' | 'backward' | 'dot' | 'restart', position, max_position }" },
    { when: 'Skip / start', payload: "{ event: 'game_rules', action: 'skip' | 'close', position, max_position }" },
  ],
  usage: {
    when: ['First visit of a game, before the first puzzle.', 'From the “Mehr” menu (“Spielregeln”).'],
    whenNot: ['Long reference texts: use the FAQ.'],
    faq: [
      { q: 'How do I keep the dialog open after “Rätsel starten”?', a: 'Call <code>event.preventDefault()</code> on <code>zon-complete</code> (or <code>zon-skip</code>).' },
      { q: 'Where does the content come from?', a: 'From the game. All three games already share the <code>GAME_INSTRUCTIONS</code> shape, so the array can be passed as is.' },
    ],
  },
  playground: {
    values: { step: '0', 'next-label': '', 'prev-label': '', 'skip-label': '', 'start-label': '', 'restart-label': '' },
    props: { steps },
    layout: 'fill',
  },
  cardZoom: 0.6,
};
