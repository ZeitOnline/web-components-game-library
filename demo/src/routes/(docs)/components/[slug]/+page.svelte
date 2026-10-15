<script>
  import { resolve } from '$app/paths';
  import Anatomy from '$lib/Anatomy.svelte';
  import CopyButton from '$lib/CopyButton.svelte';
  import Playground from '$lib/Playground.svelte';
  import Toc from '$lib/Toc.svelte';

  let { data } = $props();
  const c = $derived(data.component);
  const importLine = $derived(`import '${c.importPath}';`);
  const sourceUrl = $derived(`https://github.com/ZeitOnline/web-components-game-library/blob/main/${c.file}`);

  // The API tables only show the groups a component has.
  const api = $derived(
    [
      ['attributes', 'Attributes', c.attributes.length],
      ['properties', 'Properties', c.properties.length],
      ['methods', 'Methods', c.methods.length],
      ['events', 'Events', c.events.length],
      ['slots', 'Slots', c.slots.length],
      ['css', 'CSS custom properties', c.cssProps.length],
    ].filter(([, , n]) => n),
  );

  const toc = $derived(
    /** @type {[string, string][]} */ ([
      ['playground', 'Playground'],
      ...(c.anatomy ? [['anatomy', 'Anatomy']] : []),
      ['usage', 'Usage & FAQ'],
      ['api', 'API'],
      ['a11y', 'Accessibility'],
      ...(c.tracking.length ? [['tracking', 'Tracking']] : []),
      ['origin', 'Replaces'],
    ]),
  );
</script>

<svelte:head><title>{c.name} · ZEIT Game Components</title></svelte:head>

<main class="site-main" id="inhalt">
  <div class="crumb"><a href={resolve('/')}>Components</a> / {c.category}</div>
  <h1>{c.name}</h1>
  <code class="tag-name">&lt;{c.tag}&gt;</code>
  <p class="lead">{c.summary}</p>
  <ul class="status-line" aria-label="Facts">
    <li>
      <span class="status-dot status-dot--ok" aria-hidden="true"></span>
      {c.dom === 'light' ? 'Light DOM (crawlable, works without JS)' : 'Shadow DOM, themed by tokens'}
    </li>
    <li>
      <span class="status-dot" class:status-dot--ok={c.skeleton} aria-hidden="true"></span>
      {c.skeleton ? `Skeleton: .zon-skeleton--${c.skeleton}` : 'No skeleton needed'}
    </li>
    <li>
      <span class="status-dot" class:status-dot--ok={c.tracking.length} aria-hidden="true"></span>
      {c.tracking.length ? 'Emits zon-track' : 'No tracking'}
    </li>
  </ul>
  <div class="actions">
    <CopyButton text={importLine} class="action action--mono">{importLine}</CopyButton>
    <a class="action" href={sourceUrl}>Source <span aria-hidden="true">↗</span></a>
  </div>

  <section class="section" id="playground" aria-labelledby="h-pg">
    <h2 id="h-pg">Playground</h2>
    <p>Change attributes, call methods and watch the events. The code below is exactly what is rendered.</p>
    {#key c.slug}<Playground component={c} />{/key}
  </section>

  {#if c.anatomy}
    <section class="section" id="anatomy" aria-labelledby="h-anatomy">
      <h2 id="h-anatomy">Anatomy</h2>
      <p>
        Shadow parts, measured on the real rendering. Style them from the page with <code>{c.tag}::part(name)</code>;
        everything else is encapsulated.
      </p>
      {#key c.slug}<Anatomy component={c} />{/key}
    </section>
  {/if}

  <section class="section" id="usage" aria-labelledby="h-usage">
    <h2 id="h-usage">Usage</h2>
    <div class="dos">
      <div>
        <h3>When to use</h3>
        <!-- Definition texts are trusted (repo content). -->
        <ul>{#each c.usage.when as t, i (i)}<li>{@html t}</li>{/each}</ul>
      </div>
      <div>
        <h3>When not to use</h3>
        <ul>{#each c.usage.whenNot as t, i (i)}<li>{@html t}</li>{/each}</ul>
      </div>
    </div>
    {#if c.usage.faq.length}
      <h3>FAQ</h3>
      <div class="faq">
        {#each c.usage.faq as f, i (i)}
          <details>
            <summary>{f.q}</summary>
            <p>{@html f.a}</p>
          </details>
        {/each}
      </div>
    {/if}
  </section>

  <section class="section" id="api" aria-labelledby="h-api">
    <h2 id="h-api">API</h2>
    <p>Also in the doc comment at the top of <code>{c.file}</code> and typed in <code>src/index.d.ts</code>.</p>
    {#each api as [key, label] (key)}
      <h3 id="api-{key}">{label}</h3>
      <div class="panel panel--scroll">
        <table class="table">
          {#if key === 'attributes'}
            <thead><tr><th>Name</th><th>Values</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              {#each c.attributes as a (a.name)}
                <tr>
                  <td><code>{a.name}</code></td>
                  <td>
                    {#if a.type === 'enum'}{(a.options ?? []).filter((o) => o).join(' · ')}{:else if a.type === 'boolean'}boolean{:else}text{/if}
                  </td>
                  <td>{#if a.default}<code>{a.default}</code>{:else}—{/if}</td>
                  <td>{@html a.description}</td>
                </tr>
              {/each}
            </tbody>
          {:else if key === 'properties'}
            <thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead>
            <tbody>
              {#each c.properties as p (p.name)}
                <tr><td><code>{p.name}</code></td><td><code>{p.type}</code></td><td>{@html p.description}</td></tr>
              {/each}
            </tbody>
          {:else if key === 'methods'}
            <thead><tr><th>Method</th><th>Description</th></tr></thead>
            <tbody>
              {#each c.methods as m (m.name)}
                <tr><td><code>{m.name}</code></td><td>{m.description}</td></tr>
              {/each}
            </tbody>
          {:else if key === 'events'}
            <thead><tr><th>Event</th><th>detail</th><th>Description</th></tr></thead>
            <tbody>
              {#each c.events as e (e.name)}
                <tr>
                  <td><code>{e.name}</code>{#if e.cancelable}<br /><span class="badge">cancelable</span>{/if}</td>
                  <td><code>{e.detail}</code></td>
                  <td>{@html e.description}</td>
                </tr>
              {/each}
              {#if c.tracking.length}
                <tr>
                  <td><code>zon-track</code></td>
                  <td><code>{'{ component, …payload }'}</code></td>
                  <td>Analytics intent, see <a href="#tracking">Tracking</a>.</td>
                </tr>
              {/if}
            </tbody>
          {:else if key === 'slots'}
            <thead><tr><th>Slot</th><th>Description</th></tr></thead>
            <tbody>
              {#each c.slots as s (s.name)}
                <tr><td><code>{s.name || '(default)'}</code></td><td>{@html s.description}</td></tr>
              {/each}
            </tbody>
          {:else}
            <thead><tr><th>Property</th><th>Description</th></tr></thead>
            <tbody>
              {#each c.cssProps as p (p.name)}
                <tr><td><code>{p.name}</code></td><td>{p.description}</td></tr>
              {/each}
            </tbody>
          {/if}
        </table>
      </div>
    {/each}
    <p class="meta api-note">All events bubble and are composed: listen on the element or anywhere above it.</p>
  </section>

  <section class="section" id="a11y" aria-labelledby="h-a11y">
    <h2 id="h-a11y">Accessibility</h2>
    <div class="panel">
      <ul class="checklist">
        {#each c.a11y as a (a.topic)}<li><strong>{a.topic}</strong><span>{a.text}</span></li>{/each}
      </ul>
    </div>
  </section>

  {#if c.tracking.length}
    <section class="section" id="tracking" aria-labelledby="h-tracking">
      <h2 id="h-tracking">Tracking</h2>
      <p>
        The component never writes to <code>dataLayer</code>. It emits <code>zon-track</code>;
        <a href={resolve('/guides/[slug]', { slug: 'tracking' })}><code>connectTracking()</code></a> forwards it.
      </p>
      <div class="panel panel--scroll">
        <table class="table">
          <thead><tr><th>When</th><th>Payload</th></tr></thead>
          <tbody>
            {#each c.tracking as t (t.when)}<tr><td>{t.when}</td><td><code>{t.payload}</code></td></tr>{/each}
          </tbody>
        </table>
      </div>
    </section>
  {/if}

  <section class="section" id="origin" aria-labelledby="h-origin">
    <h2 id="h-origin">Replaces</h2>
    <p>The copies in the games this component is meant to replace.</p>
    <div class="panel">
      <ul class="checklist origin">
        {#each c.replaces as r, i (i)}<li><span>{@html r}</span></li>{/each}
      </ul>
    </div>
  </section>
</main>

<aside class="site-rail" aria-label="On this page">
  <div>
    <div>
      <p class="rail-title">On this page</p>
      {#key c.slug}<Toc items={toc} />{/key}
    </div>
    <div class="info-box">
      <p class="rail-title">Import</p>
      <p>Only this component:</p>
      <code>{importLine}</code>
      <p class="rail-gap">All of them:</p>
      <code>import '@zeitonline/game-components';</code>
    </div>
    {#if c.skeleton}
      <div class="info-box">
        <p class="rail-title">No layout shift</p>
        <p>Put the skeleton from <code class="inline">critical.css</code> inside the tag.</p>
        <a href={resolve('/guides/[slug]', { slug: 'skeletons' })}>Skeletons guide →</a>
      </div>
    {/if}
  </div>
</aside>

<style>
  .api-note {
    margin-top: 12px;
  }
  .origin li {
    grid-template-columns: minmax(0, 1fr);
  }
  .rail-gap {
    margin-top: 12px !important;
  }
  .info-box .inline {
    display: inline;
  }
</style>
