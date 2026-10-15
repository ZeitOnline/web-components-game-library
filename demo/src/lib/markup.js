/**
 * Markup, live elements and snippets from ONE component definition + control values.
 * The stage, the anatomy and every code tab go through these functions, so the code
 * shown is exactly what is rendered.
 */

/** @typedef {import('./components/types').ComponentDef} ComponentDef */
/** @typedef {Record<string, string | boolean | null>} Values */

const escapeAttr = (/** @type {string} */ v) => v.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

/** @param {ComponentDef} def @param {string} name */
const attrDef = (def, name) => def.attributes.find((a) => a.name === name);

/**
 * Attribute value to set, or null to remove it. Text: empty = not set.
 * @param {ComponentDef} def @param {string} name @param {string | boolean | null} value
 */
export function attrValue(def, name, value) {
  const type = attrDef(def, name)?.type;
  if (type === 'boolean') return value ? '' : null;
  if (type === 'text') return value ? String(value) : null;
  return value === null || value === undefined ? null : String(value);
}

/** Attribute list as written in HTML. @param {ComponentDef} def @param {Values} values */
export function attrList(def, values) {
  return Object.entries(values)
    .map(([name, value]) => [name, attrValue(def, name, value)])
    .filter(([, v]) => v !== null)
    .map(([name, v]) => (v === '' && attrDef(def, name)?.type === 'boolean' ? name : `${name}="${escapeAttr(v)}"`));
}

const indent = (/** @type {string} */ text, pad = '  ') =>
  text
    .split('\n')
    .map((l) => (l ? pad + l : l))
    .join('\n');

/**
 * `<tag a="b">…</tag>`, attributes on one line or wrapped when long.
 * @param {ComponentDef} def @param {Values} values @param {string[]} [extra] framework bindings
 */
export function elementHTML(def, values, extra = []) {
  const attrs = [...attrList(def, values), ...extra];
  const oneLine = `<${def.tag}${attrs.map((a) => ' ' + a).join('')}>`;
  const open =
    oneLine.length <= 80 || attrs.length < 2 ? oneLine : `<${def.tag}\n${attrs.map((a) => '  ' + a).join('\n')}\n>`;
  const body = def.playground.html ? `\n${indent(def.playground.html)}\n` : '';
  return `${open}${body}</${def.tag}>`;
}

/** Applies control values to a live element. @param {HTMLElement} el @param {ComponentDef} def @param {Values} values */
export function applyValues(el, def, values) {
  for (const [name, value] of Object.entries(values)) {
    const v = attrValue(def, name, value);
    if (v === null) {
      if (el.hasAttribute(name)) el.removeAttribute(name);
    } else if (el.getAttribute(name) !== v) {
      el.setAttribute(name, v);
    }
  }
}

/** Reads a control value back from the element (components reflect state). */
export function readValue(/** @type {HTMLElement} */ el, /** @type {ComponentDef} */ def, /** @type {string} */ name, /** @type {any} */ current) {
  const a = attrDef(def, name);
  const raw = el.getAttribute(name);
  if (a?.type === 'boolean') return raw !== null;
  if (a?.type === 'text') return raw ?? '';
  if (raw === null) return a?.options?.includes(null) ? null : current;
  return raw;
}

/**
 * Renders the component into `host` once it is defined and sets its properties.
 * @param {HTMLElement} host @param {ComponentDef} def @param {Values} values
 */
export async function mount(host, def, values) {
  await customElements.whenDefined(def.tag);
  host.innerHTML = elementHTML(def, values);
  const el = /** @type {HTMLElement} */ (host.querySelector(def.tag));
  Object.assign(el, structuredCloneSafe(def.playground.props ?? {}));
  return el;
}

/** Fresh copies per instance, so one stage cannot mutate another's data. Functions stay. */
function structuredCloneSafe(/** @type {Record<string, unknown>} */ props) {
  return Object.fromEntries(
    Object.entries(props).map(([k, v]) => [k, Array.isArray(v) ? v.map((x) => (x && typeof x === 'object' ? { ...x } : x)) : v]),
  );
}

/** JS literal for snippets: unquoted keys, long strings (SVG) shortened. */
export function toJs(/** @type {unknown} */ value) {
  return JSON.stringify(value, (_k, v) => (typeof v === 'string' && v.length > 60 ? `${v.slice(0, 20)}…` : v), 2)
    .replace(/"(\w+)":/g, '$1:')
    .replace(/"/g, "'");
}

/** @param {ComponentDef} def */
function propEntries(def) {
  const props = def.playground.props ?? {};
  return Object.keys(props).map((name) => ({
    name,
    code: def.playground.propsCode?.[name] ?? toJs(props[name]),
    isObject: typeof props[name] === 'object',
  }));
}

const firstEvent = (/** @type {ComponentDef} */ def) => def.events.find((e) => e.name !== 'zon-track');
const camel = (/** @type {string} */ s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());

/** @param {ComponentDef} def @param {Values} values */
export function snippets(def, values) {
  const props = propEntries(def);
  const event = firstEvent(def);
  const handlerName = event ? 'on' + camel(event.name.replace(/^zon-/, '-')) : '';

  // Plain HTML + a module script, as on a static page.
  const htmlScript = [
    `import '${def.importPath}';`,
    ...(props.length || event ? ['', `const el = document.querySelector('${def.tag}');`] : []),
    ...props.map((p) => `el.${p.name} = ${p.code};`),
    ...(event ? [`el.addEventListener('${event.name}', (e) => console.log(e.detail));`] : []),
  ];
  const html = `${elementHTML(def, values)}\n\n<script type="module">\n${indent(htmlScript.join('\n'))}\n</script>`;

  // Svelte 5: client-only import; object props are set as properties.
  const stringProps = props.filter((p) => !p.isObject);
  const svelteBindings = [
    ...props.filter((p) => p.isObject).map((p) => `{${p.name}}`),
    ...(stringProps.length
      ? [`{@attach props({ ${stringProps.map((p) => p.name).join(', ')} })}`]
      : []),
    ...(event ? [`on${event.name}={(e) => console.log(e.detail)}`] : []),
  ];
  const svelteScript = [
    "import { onMount } from 'svelte';",
    ...(stringProps.length ? ["import { props } from '$lib/props.js'; // see the Frameworks guide"] : []),
    `onMount(() => import('${def.importPath}'));`,
    ...(props.length ? [''] : []),
    ...props.map((p) => `const ${p.name} = ${p.code};`),
  ];
  const svelte = `<script>\n${indent(svelteScript.join('\n'))}\n</script>\n\n${elementHTML(def, values, svelteBindings)}`;

  // Angular: CUSTOM_ELEMENTS_SCHEMA, property and event bindings.
  const angularBindings = [
    ...props.map((p) => `[${p.name}]="${p.name}"`),
    ...(event ? [`(${event.name})="${handlerName}($event)"`] : []),
  ];
  const angularTs = [
    `// main.ts\nimport '${def.importPath}';`,
    '',
    '// component',
    '@Component({',
    "  selector: 'app-game',",
    '  schemas: [CUSTOM_ELEMENTS_SCHEMA],',
    "  templateUrl: './game.component.html',",
    '})',
    'export class GameComponent {',
    ...props.map((p) => indent(`${p.name} = ${p.code};`)),
    ...(event ? [`  ${handlerName}(event: CustomEvent) { console.log(event.detail); }`] : []),
    '}',
  ];
  const angular = `<!-- game.component.html -->\n${elementHTML(def, values, angularBindings)}\n\n${angularTs.join('\n')}`;

  return { html, svelte, angular };
}
