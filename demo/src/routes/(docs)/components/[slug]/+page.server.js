import { componentContent } from '$lib/server/component-content.js';

// Written content (Markdown, edited in the CMS) comes from the server; the universal
// load in +page.js adds the definition with the playground functions.
export const load = ({ params }) => ({ content: componentContent(params.slug) });
