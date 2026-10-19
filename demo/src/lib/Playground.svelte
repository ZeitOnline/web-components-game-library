<!--
  Playground: stage, controls, methods, event log and code from ONE definition.

  The stage holds the real custom element. Controls write attributes onto it, and a
  MutationObserver reads them back, so state the component reflects itself (dialog
  `open`, instructions `step`, navigation `disabled-actions`) shows in the controls.
  The code tabs are generated from the same values (see markup.js).

  `game-name` is a select of the games in content/games: picking one also applies
  the definition's `game` preset (category, artwork, icon, …).
-->
<script>
  import { onMount } from 'svelte';
  import CopyButton from './CopyButton.svelte';
  import { GAME_CATALOG, gameByName } from './games.js';
  import { applyContent, applyValues, elementHTML, mount, readValue, snippets } from './markup.js';

  /** @type {{ component: import('./components/types').ComponentDef }} */
  let { component } = $props();
  // The page rebuilds the playground per component ({#key}); read the definition once.
  // svelte-ignore state_referenced_locally
  const def = component;
  const pg = def.playground;
  const defaults = { ...pg.values };
  const controls = Object.keys(defaults).map((name) => def.attributes.find((a) => a.name === name));
  const gameAttr = controls.find((a) => a?.game);
  const groups = ['enum', 'boolean', 'text']
    .map((type) => controls.filter((a) => a?.type === type && !a.game))
    .filter((g) => g.length);
  const listened = [...def.events.map((e) => e.name), 'zon-track'];

  let values = $state({ ...defaults });
  /** Light DOM and properties; replaced when another game is picked. */
  const initialContent = { html: pg.html, props: pg.props };
  let content = $state.raw(initialContent);
  // Server-rendered into the stage, so the element (and its skeleton) is there before any script.
  const initialMarkup = elementHTML(def, defaults, [], pg.html);
  const escapeText = (/** @type {string} */ t) => t.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const unescapeText = (/** @type {string} */ t) => t.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');

  /** The "text" control: the element's content, when it is plain text. */
  function setText(/** @type {string} */ text) {
    content = { ...content, html: escapeText(text) };
    if (el) applyContent(el, content);
  }
  let stageTheme = $state('page');
  let width = $state('full');
  let tab = $state('html');
  /** @type {{ id: number, time: string, name: string, detail: string, prevented: boolean }[]} */
  let log = $state([]);
  let inspected = $state('');
  /** @type {HTMLElement | undefined} */
  let host = $state();
  /** @type {HTMLElement | undefined} */
  let el = $state();

  const code = $derived(snippets(def, values, content));
  const dirty = $derived(content !== initialContent || Object.keys(defaults).some((k) => values[k] !== defaults[k]));
  let nextId = 0;

  function refreshInspect() {
    if (el && pg.inspect) requestAnimationFrame(() => (inspected = el ? pg.inspect.read(el) : ''));
  }

  onMount(() => {
    let observer;
    /** @param {Event} e */
    const onEvent = (e) => {
      const prevented = Boolean(pg.prevent?.includes(e.type));
      if (prevented) e.preventDefault();
      const detail = /** @type {CustomEvent} */ (e).detail;
      log = [
        {
          id: nextId++,
          time: new Date().toLocaleTimeString('de-DE'),
          name: e.type,
          detail: JSON.stringify(detail, (_k, v) => (v instanceof Element ? `<${v.localName}>` : v)) ?? '',
          prevented,
        },
        ...log,
      ].slice(0, 30);
      refreshInspect();
    };
    for (const name of listened) host?.addEventListener(name, onEvent);

    mount(/** @type {HTMLElement} */ (host), def, $state.snapshot(values), content).then((element) => {
      el = element;
      observer = new MutationObserver(() => {
        for (const name of Object.keys(defaults)) {
          const v = readValue(element, def, name, values[name]);
          if (v !== values[name]) values[name] = v;
        }
        refreshInspect();
      });
      observer.observe(element, { attributes: true, attributeFilter: Object.keys(defaults) });
      refreshInspect();
    });

    return () => {
      observer?.disconnect();
      for (const name of listened) host?.removeEventListener(name, onEvent);
      // Close a dialog left open when leaving the page.
      /** @type {any} */ (el)?.close?.();
    };
  });

  $effect(() => {
    if (el) applyValues(el, def, values);
  });

  function reset() {
    values = { ...defaults };
    content = initialContent;
    if (el) applyContent(el, content);
  }

  /** @param {string} name */
  function pickGame(name) {
    if (!gameAttr) return;
    values[gameAttr.name] = name;
    const game = gameByName(name);
    const preset = game && pg.game ? pg.game(game) : {};
    Object.assign(values, preset.values ?? {});
    content = {
      html: preset.html ?? content.html,
      props: preset.props ? { ...content.props, ...preset.props } : content.props,
    };
    if (el) applyContent(el, content);
  }

  const TABS = /** @type {const} */ ([
    ['html', 'HTML'],
    ['svelte', 'Svelte'],
    ['angular', 'Angular'],
  ]);
  const WIDTHS = [
    ['360', '360'],
    ['600', '600'],
    ['900', '900'],
    ['full', 'Full'],
  ];
</script>

<div class="panel playground">
  <div class="panel-head">
    <span class="seg" role="group" aria-label="Stage theme">
      {#each [['page', 'Page'], ['light', 'Light'], ['dark', 'Dark']] as [key, label] (key)}
        <button type="button" aria-pressed={stageTheme === key} onclick={() => (stageTheme = key)}>{label}</button>
      {/each}
    </span>
    {#if pg.width}
      <span class="panel-head__end">
        <span class="meta" id="w-{def.slug}">Container</span>
        <span class="seg" role="group" aria-labelledby="w-{def.slug}">
          {#each WIDTHS as [key, label] (key)}
            <button type="button" aria-pressed={width === key} onclick={() => (width = key)}>{label}</button>
          {/each}
        </span>
      </span>
    {/if}
  </div>

  <div
    class="stage stage--{stageTheme}"
    class:stage--fill={pg.layout === 'fill'}
  >
    {#if pg.note}<p class="stage-note">{pg.note}</p>{/if}
    <div
      class="stage-host"
      class:stage-host--sized={width !== 'full'}
      class:stage-host--reserve={pg.reserve}
      style:--reserve={pg.reserve}
      style:width={width === 'full' ? null : `${width}px`}
      bind:this={host}
    >
      <!-- The element is adopted by mount() and then changed in place; this markup never re-renders. -->
      {@html initialMarkup}
    </div>
  </div>

  <div class="controls" role="group" aria-label="Attributes">
    {#if pg.text}
      <label class="label" for="t-{def.slug}">text</label>
      <span class="control control--wrap">
        <input id="t-{def.slug}" class="field" type="text" maxlength="80" value={unescapeText(content.html ?? '')} oninput={(e) => setText(e.currentTarget.value)} />
        <span class="meta">content between the tags</span>
      </span>
      <span class="rule" aria-hidden="true"></span>
    {/if}
    {#if gameAttr}
      <label class="label" for="g-{def.slug}">{gameAttr.name}</label>
      <span class="control control--wrap">
        <span class="select">
          <select id="g-{def.slug}" value={values[gameAttr.name]} onchange={(e) => pickGame(e.currentTarget.value)}>
            {#if !gameByName(/** @type {string} */ (values[gameAttr.name]))}<option value={values[gameAttr.name]}>{values[gameAttr.name] || '—'}</option>{/if}
            {#each GAME_CATALOG as g (g.id)}<option value={g.name}>{g.name}</option>{/each}
          </select>
        </span>
        <span class="meta">{gameByName(/** @type {string} */ (values[gameAttr.name]))?.subcategory ?? ''}</span>
      </span>
      <span class="rule" aria-hidden="true"></span>
    {/if}
    {#each groups as group, g (g)}
      {#if g > 0}<span class="rule" aria-hidden="true"></span>{/if}
      {#each group as a (a.name)}
        {#if a.type === 'enum'}
          <span class="label" id="l-{def.slug}-{a.name}">{a.name}</span>
          <span class="control">
            <span class="seg" role="group" aria-labelledby="l-{def.slug}-{a.name}">
              {#each a.options ?? [] as option (option)}
                <button type="button" aria-pressed={values[a.name] === option} onclick={() => (values[a.name] = option)}>
                  {option === null ? '—' : option === '' ? '(none)' : option}
                </button>
              {/each}
            </span>
          </span>
        {:else if a.type === 'boolean'}
          <span class="label" id="l-{def.slug}-{a.name}">{a.name}</span>
          <span class="control">
            <button
              type="button"
              class="switch"
              role="switch"
              aria-checked={values[a.name] === true}
              aria-labelledby="l-{def.slug}-{a.name}"
              onclick={() => (values[a.name] = !values[a.name])}
            ></button>
          </span>
        {:else}
          <label class="label" for="f-{def.slug}-{a.name}">{a.name}</label>
          <span class="control">
            <input
              id="f-{def.slug}-{a.name}"
              class="field"
              type="text"
              placeholder={a.placeholder ?? a.default ?? 'not set'}
              bind:value={values[a.name]}
            />
          </span>
        {/if}
      {/each}
    {/each}
    <button
      type="button"
      class="reset"
      class:is-hidden={!dirty}
      inert={!dirty}
      aria-label="Reset"
      title="Reset"
      onclick={reset}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
    </button>
    {#if pg.actions?.length}
      <span class="rule" aria-hidden="true"></span>
      <span class="label">Methods</span>
      <span class="control control--wrap">
        {#each pg.actions as action (action.label)}
          <button type="button" class="method-button" onclick={() => el && action.run(el)}>{action.label}</button>
        {/each}
      </span>
    {/if}
  </div>

  <div class="log">
    <div class="panel-head">
      <span class="code-title">Events</span>
      <span class="meta">{listened.join(' · ')}</span>
      <span class="panel-head__end">
        {#if log.length}<button type="button" class="link-button" onclick={() => (log = [])}>Clear</button>{/if}
      </span>
    </div>
    <ol class="log__list" aria-live="polite">
      {#each log as entry (entry.id)}
        <li>
          <span class="log__time">{entry.time}</span>
          <code class="log__name" class:log__name--track={entry.name === 'zon-track'}>{entry.name}</code>
          <code class="log__detail">{entry.detail}</code>
          {#if entry.prevented}<span class="badge badge--warn" title="preventDefault() on the stage, so the page stays here">prevented</span>{/if}
        </li>
      {:else}
        <li class="log__empty">Interact with the component to see its events.</li>
      {/each}
    </ol>
  </div>

  {#if pg.inspect}
    <div class="codeblock">
      <div class="panel-head"><span class="code-title">{pg.inspect.label}</span></div>
      <pre><code>{inspected || '—'}</code></pre>
    </div>
  {/if}

  <div class="codeblock">
    <div class="panel-head">
      <span class="seg" role="group" aria-label="Code">
        {#each TABS as [key, label] (key)}
          <button type="button" aria-pressed={tab === key} onclick={() => (tab = key)}>{label}</button>
        {/each}
      </span>
      <span class="panel-head__end"><CopyButton text={code[tab]} class="link-button" /></span>
    </div>
    <pre><code>{code[tab]}</code></pre>
  </div>
</div>

<style>
  .stage {
    flex-direction: column;
    gap: 12px;
    border-bottom: 1px solid var(--site-border);
  }
  .stage-host {
    max-width: 100%;
  }
  .stage--fill .stage-host {
    width: 100%;
  }
  /* Until the element is defined it has no height; keep the stage from jumping. */
  /* :global: the element comes from {@html}, so it has no Svelte scope class. */
  .stage-host--reserve:has(> :global(:not(:defined))) {
    min-height: var(--reserve);
  }
  .stage-host--sized {
    align-self: center;
    outline: 1px dashed color-mix(in srgb, var(--site-accent) 60%, transparent);
    outline-offset: 4px;
  }
  .stage-note {
    margin: 0;
    max-width: 48ch;
    font-size: 14px;
    text-align: center;
    color: var(--site-muted);
  }
  .controls {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 12px;
    row-gap: 6px;
    padding: 10px 12px;
  }
  .label {
    grid-column: 1;
    font-family: var(--site-mono);
    font-size: 12px;
    color: var(--site-muted);
  }
  .control {
    grid-column: 2;
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    justify-self: start;
    max-width: 100%;
  }
  .control--wrap {
    flex-wrap: wrap;
    gap: 6px;
  }
  .rule {
    grid-column: 1 / -1;
    margin: 4px 0;
    border-top: 1px solid var(--site-border);
  }
  .reset {
    grid-column: 3;
    grid-row: 1;
    justify-self: end;
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--site-muted);
  }
  .reset.is-hidden {
    visibility: hidden;
  }
  .log,
  .codeblock {
    border-top: 1px solid var(--site-border);
  }
  .log .meta {
    font-family: var(--site-mono);
    font-size: 11px;
  }
  .log__list {
    max-height: 180px;
    margin: 0;
    padding: 6px 0;
    overflow: auto;
    list-style: none;
    font-size: 12px;
  }
  .log__list li {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 10px;
    padding: 3px 12px;
  }
  .log__time {
    color: var(--site-muted);
    font-variant-numeric: tabular-nums;
  }
  .log__name {
    font-weight: 700;
    color: var(--site-accent);
  }
  .log__name--track {
    color: var(--site-muted);
  }
  .log__detail {
    color: var(--site-muted);
  }
  .log__empty {
    color: var(--site-muted);
  }
  .code-title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--site-muted);
  }
  .codeblock pre {
    max-height: 420px;
  }
  .playground :global(.link-button) {
    height: 28px;
    padding: 0 8px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--site-focus);
    font-size: 12px;
    font-weight: 600;
  }
  .playground :global(.link-button small) {
    font-size: inherit;
    color: inherit;
  }
  @media (max-width: 600px) {
    .controls {
      grid-template-columns: minmax(0, 1fr) auto;
    }
    .label,
    .control {
      grid-column: 1;
    }
    .control {
      margin-bottom: 6px;
    }
    .reset {
      grid-column: 2;
    }
  }
</style>
