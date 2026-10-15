/**
 * The games: one entry per game in content/games/<id>.yml (edited in Sveltia CMS),
 * with the logo and the 18×18 mini mark as inline SVG code. This repo is the source
 * of these icons. Used by the playground's "game-name" select and the Game icons page.
 */

const entries = import.meta.glob('/content/games/*.yml', { eager: true, import: 'default' });

/** @typedef {'logic' | 'word' | 'crossword' | 'mini' | 'quiz'} Category */
/**
 * @typedef {{
 *   id: string, name: string, category: Category, subcategory: string, href: string | null, order: number,
 *   logo: string, mini: string | null, feedbackForm: string | null
 * }} Game
 */

const text = (/** @type {unknown} */ v) => (typeof v === 'string' && v.trim() ? v.trim() : null);

/** @type {Game[]} */
export const GAME_CATALOG = Object.entries(entries)
  .map(([path, raw]) => {
    const e = /** @type {Record<string, any>} */ (raw ?? {});
    return {
      id: /** @type {string} */ (path.split('/').pop()).replace(/\.ya?ml$/, ''),
      name: text(e.name) ?? 'Unnamed game',
      category: e.category ?? 'logic',
      subcategory: text(e.subcategory) ?? '',
      href: text(e.href),
      order: Number(e.order ?? 999),
      logo: text(e.logo) ?? '',
      mini: text(e.mini),
      feedbackForm: text(e.feedbackForm),
    };
  })
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

/** @param {string | null | undefined} name */
export const gameByName = (name) => GAME_CATALOG.find((g) => g.name === name);

/** @param {string} id */
export const gameById = (id) => /** @type {Game} */ (GAME_CATALOG.find((g) => g.id === id));

/**
 * The SVG at a fixed square size (replaces width/height on the root <svg> only;
 * same as spielecp's `sizedGameIcon`).
 * @param {string} svg @param {number} size
 */
export const sized = (svg, size) =>
  svg.replace(/^<svg([^>]*)>/, (_m, attrs) => `<svg${attrs.replace(/\s(?:width|height)="[^"]*"/g, '')} width="${size}" height="${size}">`);

/** 36×36 tile icon for <zon-puzzle-list>: the mini mark, or the logo scaled down. @param {Game} game */
export const tileIcon = (game) => sized(game.mini ?? game.logo, 36);

/**
 * Artwork for the hero's image slot: the game's SVG logo, at the size Wortgeflecht uses
 * (120px narrow / 210px wide). Always the logo, so the artwork never clashes with the
 * category colour behind it.
 * @param {Game} game
 */
export function heroArt(game) {
  return {
    html: game.logo.replace(/^<svg/, '<svg slot="image"'),
    style: '--zon-hero-art-width: 120px; --zon-hero-art-width-wide: 210px',
  };
}
