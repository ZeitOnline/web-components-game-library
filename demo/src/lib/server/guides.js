/**
 * Guides: Markdown files with front matter in content/guides (edited in Sveltia CMS,
 * ordered by `order`), plus the project plan from docs/PLAN.md so it has a single source.
 */
import plan from '../../../../docs/PLAN.md?raw';
import { frontmatter, render } from './markdown.js';

const files = import.meta.glob('/content/guides/*.md', { query: '?raw', import: 'default', eager: true });

const guides = Object.entries(files).map(([path, source]) => {
  const { data, body } = frontmatter(/** @type {string} */ (source));
  const slug = /** @type {string} */ (path.split('/').pop()).replace(/\.md$/, '');
  return { slug, title: data.title ?? slug, summary: data.summary ?? '', order: Number(data.order ?? 99), source: body };
});

export const GUIDES = [
  ...guides.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
  // PLAN.md stays a plain repo document (no front matter); edited in code, not in the CMS.
  { slug: 'plan', title: 'Plan & trade-offs', summary: '', order: 1000, source: plan.replace(/^# .+\n/m, '') },
];

/** @param {string} slug */
export const findGuide = (slug) => GUIDES.find((g) => g.slug === slug);

export { render };
