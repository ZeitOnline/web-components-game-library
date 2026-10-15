<script>
  import { resolve } from '$app/paths';
  import { byCategory, COMPONENTS } from '$lib/components/index.js';
  import LivePreview from '$lib/LivePreview.svelte';

  let { data } = $props();
  const groups = byCategory();
  const slug = (/** @type {string} */ s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
</script>

<svelte:head><title>ZEIT Game Components</title></svelte:head>

<main class="site-main site-main--wide" id="inhalt">
  <p class="crumb">ZEIT ONLINE · Spiele</p>
  <h1 class="display">Game components</h1>
  <p class="lead">
    {COMPONENTS.length} framework-agnostic web components for the UI that all ZEIT ONLINE games share. Plain JavaScript,
    no dependencies, themed by the frame’s <code>--z-ds-*</code> tokens. The same elements run in the Angular games and in
    SvelteKit (like this site).
  </p>
  <div class="actions">
    <a class="action" href={resolve('/guides/[slug]', { slug: 'getting-started' })}>Getting started</a>
    <a class="action" href={resolve('/game-icons')}>Game icons</a>
    <a class="action" href={resolve('/games')}>Game demo <span aria-hidden="true">→</span></a>
  </div>

  {#each groups as { category, components } (category)}
    <section class="section" aria-labelledby="h-{slug(category)}">
      <h2 id="h-{slug(category)}">{category}</h2>
      <div class="cards">
        {#each components as c (c.slug)}
          <article class="card">
            <LivePreview component={c} />
            <div class="card__body">
              <a class="card__title" href={resolve('/components/[slug]', { slug: c.slug })}>{c.name}</a>
              <code class="meta">&lt;{c.tag}&gt;</code>
              <p class="card__summary">{@html data.summaries[c.slug]}</p>
            </div>
          </article>
        {/each}
      </div>
    </section>
  {/each}

  <section class="section" aria-labelledby="h-guides">
    <h2 id="h-guides">Guides</h2>
    <div class="cards">
      {#each data.guides as g (g.slug)}
        <a class="page-card" href={resolve('/guides/[slug]', { slug: g.slug })}>
          <strong>{g.title}</strong>
          {#if g.summary}<span>{g.summary}</span>{/if}
        </a>
      {/each}
    </div>
  </section>
</main>
