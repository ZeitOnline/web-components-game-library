import { gameById, heroArt } from '../games.js';

const sudoku = heroArt(gameById('sudoku'));

/** The hero skeleton from critical.css: holds the space until the element is defined. */
const skeleton = (/** @type {string} */ category) => `<div class="zon-skeleton zon-skeleton--hero" data-category="${category}" aria-hidden="true">
  <div class="zon-skeleton__card">
    <div class="zon-skeleton__image"></div>
    <div class="zon-skeleton__content">
      <span class="zon-skeleton__bone zon-skeleton__badge"></span>
      <span class="zon-skeleton__text">
        <span class="zon-skeleton__bone zon-skeleton__title"></span>
        <span class="zon-skeleton__bone zon-skeleton__date"></span>
      </span>
      <span class="zon-skeleton__bone zon-skeleton__cta"></span>
    </div>
  </div>
</div>`;

/** @type {import('./types').ComponentDef} */
export default {
  slug: 'hero',
  tag: 'zon-game-hero',
  name: 'Hero',
  category: 'Landing page',
  skeleton: 'hero',
  attributes: [
    { name: 'category', type: 'enum', options: ['logic', 'word', 'crossword', 'mini', 'quiz'], default: 'logic', description: 'Picks the frame colours <code>--z-ds-color-games-&lt;category&gt;-*</code>.' },
    { name: 'state', type: 'enum', options: ['new', 'continue', 'unplayed', 'solved'], default: 'new', description: 'Default badge and CTA text.' },
    { name: 'game-name', type: 'text', game: true, description: 'Game name, the heading.' },
    { name: 'date', type: 'text', description: 'ISO date of the puzzle, shown as “Donnerstag, 15. Okt.”.' },
    { name: 'href', type: 'text', description: 'Makes the CTA a real link (works without JS, crawlable).' },
    { name: 'cta-label', type: 'text', description: 'Overrides “Erstes Rätsel starten” / “Rätsel lösen”.' },
    { name: 'badge-label', type: 'text', description: 'Overrides “Neu” / “Weiterspielen” / “Ungelöst” / “Gelöst”.' },
    { name: 'magazine-label', type: 'text', description: 'Optional pill in the image corner, e.g. “+ ZEIT Magazin Rätsel”.' },
    { name: 'heading-level', type: 'enum', options: ['1', '2', '3'], default: '2', description: 'Level of the game-name heading.' },
  ],
  properties: [],
  methods: [],
  events: [{ name: 'zon-start', detail: '{ date, state, href }', cancelable: true, description: 'CTA click. preventDefault() keeps the link from navigating (SPA routing, rules dialog).' }],
  slots: [{ name: 'image', description: 'Game illustration (svg / img). The slotted element itself is sized.' }],
  parts: [
    { name: 'card', description: 'The card.' },
    { name: 'image', description: 'Coloured image area.' },
    { name: 'content', description: 'Text column.' },
    { name: 'badge', description: 'Yellow state badge.' },
    { name: 'title', description: 'Game name heading.' },
    { name: 'cta', description: 'Call to action (link or button).' },
  ],
  cssProps: [
    { name: '--zon-game-color', description: 'Image background (default: category base colour).' },
    { name: '--zon-hero-art-width', description: 'Illustration width, narrow layout (default 50%).' },
    { name: '--zon-hero-art-width-wide', description: 'Illustration width, wide layout (default 80%).' },
    { name: '--zon-hero-bg / --zon-hero-border', description: 'Card background and border.' },
  ],
  tracking: [{ when: 'CTA click', payload: "{ event: 'game_interaction', action: 'click', position: 'header_teaser' }" }],
  playground: {
    values: {
      category: 'logic',
      state: 'new',
      'game-name': 'Sudoku',
      date: '2026-10-15',
      href: '/games?game=sudoku',
      'cta-label': '',
      'badge-label': '',
      'magazine-label': '',
      'heading-level': '2',
      // Art widths for logos (set by the game preset); not an attribute control.
      style: sudoku.style,
    },
    html: `${skeleton('logic')}\n${sudoku.html}`,
    // Sudoku keeps its illustration; the other games show their spielecp logo, sized like Wortgeflecht's.
    game: (g) => {
      const art = heroArt(g);
      return { values: { category: g.category, style: art.style }, html: `${skeleton(g.category)}\n${art.html}` };
    },
    layout: 'fill',
    width: true,
    prevent: ['zon-start'],
  },
  cardZoom: 0.4,
};
