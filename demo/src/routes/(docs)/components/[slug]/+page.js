import { error } from '@sveltejs/kit';
import { COMPONENTS, findComponent } from '$lib/components/index.js';

export const entries = () => COMPONENTS.map(({ slug }) => ({ slug }));

// Universal load: the definitions contain functions (playground actions), which
// cannot be serialized from a server load.
export const load = ({ params }) => {
  const component = findComponent(params.slug);
  if (!component) error(404, 'Unknown component');
  return { component };
};
