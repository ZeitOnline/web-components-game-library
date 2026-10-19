export interface AttributeDef {
  name: string;
  type: 'boolean' | 'enum' | 'text';
  /** enum values; `null` means "attribute not set" */
  options?: (string | null)[];
  default?: string;
  description: string;
  /** playground: placeholder of the text field */
  placeholder?: string;
  /** false: documented only, no playground control */
  control?: false;
  /** playground: a select of the games in content/games (see games.js) */
  game?: true;
}

/** API and playground. The written content (summary, usage, FAQ, a11y, replaces) is in content/components/<slug>.md. */
export interface ComponentDef {
  slug: string;
  tag: string;
  name: string;
  category: string;
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
  tracking: { when: string; payload: string }[];
  playground: {
    /** initial attribute values; one control per key */
    values: Record<string, string | boolean | null>;
    /** light DOM content (trusted) */
    html?: string;
    /** the light DOM is plain text: show a "text" control that edits it (e.g. a button label) */
    text?: boolean;
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
    /** other entry points the example uses, added to the snippets' imports */
    imports?: string[];
    /** docs only: stage height kept until the element is defined (components without a skeleton) */
    reserve?: string;
    inspect?: { label: string; read: (el: HTMLElement) => string };
    /** what picking a game in the `game-name` select changes besides the name */
    game?: (game: import('../games.js').Game) => {
      values?: Record<string, string | boolean | null>;
      html?: string;
      props?: Record<string, unknown>;
    };
  };
  anatomy?: boolean;
  /** static overview-card preview instead of a live element */
  card?: string;
  cardZoom?: number;
  /** added in index.js */
  file?: string;
  importPath?: string;
}
