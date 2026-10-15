/**
 * Guides: Markdown files in content/guides (ordered by their number prefix) plus the
 * project plan from docs/PLAN.md, so the plan has a single source.
 */
import { Marked } from 'marked';
import plan from '../../../../docs/PLAN.md?raw';

const files = import.meta.glob('/content/guides/*.md', { query: '?raw', import: 'default', eager: true });

const slugify = (/** @type {string} */ text) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9äöüß]+/g, '-')
    .replace(/^-|-$/g, '');

/** @param {string} slug @param {string} source */
function parse(slug, source) {
  const title = source.match(/^# (.+)$/m)?.[1] ?? slug;
  const summary = source.match(/^# .+\n+([^\n#|`>-][^\n]+)/m)?.[1] ?? '';
  return { slug, title, summary, source: source.replace(/^# .+\n/m, '') };
}

export const GUIDES = [
  ...Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, source]) => parse(path.split('/').pop().replace(/^\d+-|\.md$/g, ''), /** @type {string} */ (source))),
  { ...parse('plan', plan), title: 'Plan & trade-offs' },
];

/** HTML plus the h2 list for "On this page". @param {string} source */
export function render(source) {
  /** @type {[string, string][]} */
  const toc = [];
  const marked = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const id = slugify(text);
        if (depth === 2) toc.push([id, text.replace(/<[^>]+>/g, '')]);
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
    },
  });
  // Links between guides are written as ./other.md in the repo; on the site they are /guides/other.
  const html = /** @type {string} */ (marked.parse(source)).replace(
    /href="(?:\.\.\/)?(?:docs\/)?(?:\.\/)?(?:\d+-)?([\w-]+)\.md"/g,
    (_, name) => `href="/guides/${name.toLowerCase() === 'plan' ? 'plan' : name}"`,
  );
  return { html, toc };
}

/** @param {string} slug */
export const findGuide = (slug) => GUIDES.find((g) => g.slug === slug);
