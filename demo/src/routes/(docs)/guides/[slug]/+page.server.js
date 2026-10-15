import { error } from '@sveltejs/kit';
import { findGuide, GUIDES, render } from '$lib/server/guides.js';

export const entries = () => GUIDES.map(({ slug }) => ({ slug }));

export const load = ({ params }) => {
  const guide = findGuide(params.slug);
  if (!guide) error(404, 'Unknown guide');
  const index = GUIDES.indexOf(guide);
  const { html, toc } = render(guide.source);
  const link = (/** @type {typeof guide | undefined} */ g) => (g ? { slug: g.slug, title: g.title } : null);
  return { slug: guide.slug, title: guide.title, editable: guide.slug !== 'plan', html, toc, prev: link(GUIDES[index - 1]), next: link(GUIDES[index + 1]) };
};
