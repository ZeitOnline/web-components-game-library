/**
 * Documentation data for each component: API, usage, accessibility, tracking and the
 * playground setup. The API mirrors the doc comment at the top of each file in
 * ../../../../src/components/ — update both together.
 */
import dialog from './dialog.js';
import faq from './faq.js';
import hero from './hero.js';
import instructions from './instructions.js';
import navigation from './navigation.js';
import puzzleList from './puzzle-list.js';
import result from './result.js';
import timer from './timer.js';

/** Order of the side navigation: the way a player meets them. */
export const CATEGORIES = ['Landing page', 'Game screen', 'Overlays'];

/** @type {import('./types').ComponentDef[]} */
export const COMPONENTS = [hero, puzzleList, faq, navigation, timer, result, dialog, instructions].map((c) => ({
  dom: 'shadow',
  skeleton: null,
  anatomy: c.parts.length > 0,
  ...c,
  file: `src/components/${c.tag}.js`,
  importPath: `@zeitonline/game-components/${c.slug}`,
}));

/** @param {string} slug */
export const findComponent = (slug) => COMPONENTS.find((c) => c.slug === slug);

export const byCategory = () =>
  CATEGORIES.map((category) => ({ category, components: COMPONENTS.filter((c) => c.category === category) }));
