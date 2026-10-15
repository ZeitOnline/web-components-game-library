/**
 * Svelte attachment that sets properties on a custom element once it is defined:
 *
 *   <zon-puzzle-list {@attach props({ items, icon })}></zon-puzzle-list>
 *
 * Svelte already sets object values (arrays, objects) as properties, even before the
 * element is defined. Strings are set as attributes until then, so a string property
 * like `icon` needs this. The attachment re-runs when the values change.
 *
 * @param {Record<string, unknown>} values
 * @returns {import('svelte/attachments').Attachment<HTMLElement>}
 */
export const props = (values) => (el) => {
  let active = true;
  customElements.whenDefined(el.localName).then(() => {
    if (active) Object.assign(el, values);
  });
  return () => {
    active = false;
  };
};
