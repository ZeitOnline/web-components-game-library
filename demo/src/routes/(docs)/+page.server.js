import { COMPONENTS } from '$lib/components/index.js';
import { componentContent } from '$lib/server/component-content.js';

export const load = () => ({
  summaries: Object.fromEntries(COMPONENTS.map((c) => [c.slug, componentContent(c.slug).summary])),
});
