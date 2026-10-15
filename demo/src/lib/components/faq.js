/** @type {import('./types').ComponentDef} */
export default {
  slug: 'faq',
  tag: 'zon-game-faq',
  name: 'FAQ',
  category: 'Landing page',
  summary:
    '“Häufig gestellte Fragen” accordion in the light DOM with native <details>: crawlable, works without JavaScript, adds tracking and optional JSON-LD.',
  replaces: ['sudoku / wortiger static <code>.faq</code> block', 'Wortgeflecht <code>FAQSection</code> + <code>FAQStructureData</code>'],
  dom: 'light',
  skeleton: 'faq',
  attributes: [
    { name: 'exclusive', type: 'boolean', description: 'Only one answer open at a time (native <code>&lt;details name&gt;</code>).' },
    { name: 'structured-data', type: 'boolean', description: 'Also writes a schema.org FAQPage <code>&lt;script type="application/ld+json"&gt;</code>.' },
    { name: 'heading-level', type: 'enum', options: ['2', '3', '4'], default: '2', description: 'Question heading level when rendering <code>items</code>.' },
  ],
  properties: [
    { name: 'items', type: '{ question, answer, open? }[]', description: 'Alternative to markup. <code>answer</code> is trusted HTML.' },
    { name: 'structuredData', type: 'object (read-only)', description: 'The FAQPage object; <code>faqStructuredData(items)</code> returns the same for SSR.' },
  ],
  methods: [],
  events: [{ name: 'zon-faq-toggle', detail: '{ index, question, open }', description: 'A question opened or closed.' }],
  slots: [],
  parts: [],
  cssProps: [],
  a11y: [
    { topic: 'Native', text: '<details>/<summary>: keyboard, screen readers and find-in-page work without script.' },
    { topic: 'Headings', text: 'Each question is a heading inside the summary, so the FAQ shows up in the page outline.' },
    { topic: 'Styles', text: 'Come from critical.css; the component warns in the console when they are missing.' },
  ],
  tracking: [
    { when: 'Question opened', payload: "{ event: 'game_faq', action: 'open', target: <question> }" },
    { when: 'Link in answer', payload: "{ event: 'game_faq', action: 'click', target: <href> }" },
  ],
  usage: {
    when: ['Bottom of every game landing page (SEO).'],
    whenNot: ['Rules of the game itself: use the instructions stepper.'],
    faq: [
      { q: 'Markup or items?', a: 'Markup for static and server-rendered pages: the questions are in the HTML. <code>items</code> for client-rendered apps.' },
      { q: 'Why light DOM?', a: 'Search engines and find-in-page see the text, and it works before the script loads.' },
    ],
  },
  playground: {
    values: { exclusive: true, 'structured-data': true, 'heading-level': '2' },
    html: `<details open>
  <summary><h3>Wie spielt man Sudoku?</h3></summary>
  <p>Ein Sudoku-Rätsel besteht aus neun Boxen mit jeweils 3x3 Zellen. Ziel ist es, alle Zellen so mit Ziffern zwischen 1 und 9 zu füllen, dass jede Ziffer in jeder Box, Reihe und Spalte nur einmal vorkommt.</p>
</details>
<details>
  <summary><h3>Kann ich das ZEIT Sudoku auf dem Smartphone spielen?</h3></summary>
  <p>Ja. Unsere Sudokus sind im Browser oder in der <a href="https://apps.apple.com/de/app/zeit-online/id828889166">ZEIT-App</a> spielbar.</p>
</details>
<details>
  <summary><h3>Wie oft erscheint das ZEIT Sudoku?</h3></summary>
  <p>Für alle Schwierigkeitsstufen erscheint täglich ein neues Spiel.</p>
</details>`,
    layout: 'fill',
    inspect: { label: 'JSON-LD (structuredData)', read: (el) => JSON.stringify(el.structuredData, null, 2) },
  },
  anatomy: false,
  cardZoom: 0.55,
};
