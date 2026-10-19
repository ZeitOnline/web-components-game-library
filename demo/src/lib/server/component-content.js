/**
 * The written parts of each component page, from content/components/<slug>.md
 * (edited in Sveltia CMS). The API and playground stay in src/lib/components/<slug>.js.
 */
import { block, frontmatter, inline, render } from './markdown.js';

const files = import.meta.glob('/content/components/*.md', { query: '?raw', import: 'default', eager: true });

/** @param {string} slug */
export function componentContent(slug) {
  const source = files[`/content/components/${slug}.md`];
  if (typeof source !== 'string') throw new Error(`Missing content/components/${slug}.md`);
  const { data, body } = frontmatter(source);
  const list = (/** @type {unknown} */ v) => (Array.isArray(v) ? v : []);
  return {
    summary: inline(data.summary),
    when: list(data.when).map(inline),
    whenNot: list(data.whenNot).map(inline),
    faq: list(data.faq).map((f) => ({ question: inline(f?.question), answer: block(f?.answer) })),
    a11y: list(data.a11y).map((a) => ({ topic: String(a?.topic ?? ''), text: inline(a?.text) })),
    replaces: list(data.replaces).map(inline),
    notes: body.trim() ? render(body).html : '',
  };
}
