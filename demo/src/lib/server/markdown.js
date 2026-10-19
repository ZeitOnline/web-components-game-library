/**
 * Markdown with YAML front matter: the format Sveltia CMS reads and writes.
 * Content is from the repo (trusted), rendered at build time.
 */
import { Marked } from 'marked';
import { parse as parseYaml } from 'yaml';

/** @param {string} source @returns {{ data: Record<string, any>, body: string }} */
export function frontmatter(source) {
  const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  return m ? { data: parseYaml(m[1]) ?? {}, body: source.slice(m[0].length) } : { data: {}, body: source };
}

const slugify = (/** @type {string} */ text) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9äöüß]+/g, '-')
    .replace(/^-|-$/g, '');

// Links between guides are written as ./other.md (so they also work on GitHub); on the site they are /guides/other.
const rewriteLinks = (/** @type {string} */ html) =>
  html.replace(
    /href="(?:\.\.\/)?(?:docs\/)?(?:\.\/)?(?:\d+-)?([\w-]+)\.md"/g,
    (_, name) => `href="/guides/${name.toLowerCase() === 'plan' ? 'plan' : name}"`,
  );

/** Block Markdown to HTML plus the h2 list for "On this page". @param {string} source */
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
  return { html: rewriteLinks(/** @type {string} */ (marked.parse(source))), toc };
}

const plain = new Marked();

/** One line of Markdown (`code`, **bold**, links) to inline HTML. @param {string | undefined} text */
export const inline = (text) => rewriteLinks(/** @type {string} */ (plain.parseInline(String(text ?? '').trim())));

/** A short Markdown block (FAQ answer) to HTML. @param {string | undefined} text */
export const block = (text) => rewriteLinks(/** @type {string} */ (plain.parse(String(text ?? '').trim())));
