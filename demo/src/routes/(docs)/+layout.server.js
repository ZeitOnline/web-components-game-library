import { GUIDES } from '$lib/server/guides.js';

// Only what the menus need.
export const load = () => ({
  guides: GUIDES.map(({ slug, title }) => ({ slug, title })),
});
