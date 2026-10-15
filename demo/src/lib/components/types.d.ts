export interface AttributeDef {
  name: string;
  type: 'boolean' | 'enum' | 'text';
  /** enum values; `null` means "attribute not set" */
  options?: (string | null)[];
  default?: string;
  description: string;
  /** false: documented only, no playground control */
  control?: false;
}

export interface ComponentDef {
  slug: string;
  tag: string;
  name: string;
  category: string;
  summary: string;
  /** game code this component replaces (trusted HTML) */
  replaces: string[];
  dom?: 'shadow' | 'light';
  /** skeleton modifier in critical.css, e.g. "hero" */
  skeleton?: string | null;
  attributes: AttributeDef[];
  properties: { name: string; type: string; description: string }[];
  methods: { name: string; description: string }[];
  events: { name: string; detail: string; description: string; cancelable?: boolean }[];
  slots: { name: string; description: string }[];
  parts: { name: string; description: string }[];
  cssProps: { name: string; description: string }[];
  a11y: { topic: string; text: string }[];
  tracking: { when: string; payload: string }[];
  usage: { when: string[]; whenNot: string[]; faq: { q: string; a: string }[] };
  playground: {
    /** initial attribute values; one control per key */
    values: Record<string, string | boolean | null>;
    /** light DOM content (trusted) */
    html?: string;
    /** complex data set as properties */
    props?: Record<string, unknown>;
    /** how a prop is shown in snippets, when JSON does not fit (functions) */
    propsCode?: Record<string, string>;
    actions?: { label: string; run: (el: HTMLElement) => void }[];
    layout?: 'center' | 'fill';
    /** container width switch, for container-query layouts */
    width?: boolean;
    /** events whose default action is prevented on the stage (navigation) */
    prevent?: string[];
    note?: string;
    inspect?: { label: string; read: (el: HTMLElement) => string };
  };
  anatomy?: boolean;
  /** static overview-card preview instead of a live element */
  card?: string;
  cardZoom?: number;
  /** added in index.js */
  file?: string;
  importPath?: string;
}
