import { GAMES } from '../games-data.js';

/** @type {import('./types').ComponentDef} */
export default {
  slug: 'puzzle-list',
  tag: 'zon-puzzle-list',
  name: 'Puzzle list',
  category: 'Landing page',
  summary: '“Weitere Rätsel” block: heading, “Alle anzeigen” and a grid of puzzle rows with status. Every row is a real link.',
  replaces: ['sudoku <code>home/hero/archive-teaser</code> + <code>components/teaser</code>', 'Spiele CP <code>PuzzleCard</code> row'],
  skeleton: 'puzzle-list',
  attributes: [
    { name: 'category', type: 'enum', options: ['logic', 'word', 'crossword', 'mini', 'quiz'], default: 'logic', description: 'Icon tile colours.' },
    { name: 'columns', type: 'enum', options: ['1', '2', '3'], default: '2', description: 'Maximum columns on wide containers.' },
    { name: 'heading', type: 'text', default: 'Weitere Rätsel', description: 'Heading.' },
    { name: 'game-name', type: 'text', description: 'Small supporter line above each date.' },
    { name: 'all-label', type: 'text', default: 'Alle anzeigen', description: 'An empty string hides the link.' },
    { name: 'all-href', type: 'text', description: 'Target of “Alle anzeigen”. Without it a button is rendered (sudoku opens the archive dialog).' },
  ],
  properties: [
    { name: 'items', type: '{ date, href?, label?, status?: "started" | "concluded" | "locked" }[]', description: 'Rows.' },
    { name: 'icon', type: 'string (trusted SVG)', description: 'Game icon, 36×36.' },
  ],
  methods: [],
  events: [
    { name: 'zon-puzzle-select', detail: '{ item, index }', cancelable: true, description: 'Row click. preventDefault() stops navigation (e.g. paywall for locked rows).' },
    { name: 'zon-show-all', detail: '{ href }', cancelable: true, description: '“Alle anzeigen”.' },
  ],
  slots: [],
  parts: [
    { name: 'section', description: 'The block.' },
    { name: 'heading', description: 'h2.' },
    { name: 'all', description: '“Alle anzeigen”.' },
    { name: 'row', description: 'One puzzle row (link).' },
  ],
  cssProps: [{ name: '--zon-game-icon-bg / --zon-game-icon-shadow-bg', description: 'Override the category tile colours.' }],
  a11y: [
    { topic: 'Links', text: 'Each row is an <a href>: middle-click, “open in new tab” and crawling work.' },
    { topic: 'Status', text: 'Started / solved / locked are part of the link text, not only an icon.' },
    { topic: 'List', text: 'Rows are a real list, so screen readers announce the count.' },
  ],
  tracking: [{ when: 'Row / all click', payload: "{ event: 'game_interaction', action: 'click', position: 'game_cp' | 'archive' }" }],
  usage: {
    when: ['Below the hero: the last few puzzles.', 'Inside the archive dialog with columns="1".'],
    whenNot: ['Navigation between different games (that is a game card / carousel).'],
    faq: [
      { q: 'Why is icon a property and not an attribute?', a: 'It is an SVG string. In Svelte set it once the element is defined (see the Frameworks guide); in Angular use <code>[icon]="icon"</code>.' },
    ],
  },
  playground: {
    values: { category: 'logic', columns: '2', heading: 'Weitere Sudoku Rätsel', 'game-name': 'Sudoku', 'all-label': '', 'all-href': '' },
    props: {
      items: [
        { date: '2026-10-14', href: '#/sudoku/2026-10-14', status: 'concluded' },
        { date: '2026-10-13', href: '#/sudoku/2026-10-13', status: 'started' },
        { date: '2026-10-12', href: '#/sudoku/2026-10-12' },
        { date: '2026-10-11', href: '#/sudoku/2026-10-11', status: 'locked' },
      ],
      icon: GAMES.sudoku.tileIcon,
    },
    layout: 'fill',
    width: true,
    prevent: ['zon-puzzle-select', 'zon-show-all'],
  },
  cardZoom: 0.5,
};
