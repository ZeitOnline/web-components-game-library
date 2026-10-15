<script>
  import { resolve } from '$app/paths';
  import Toc from '$lib/Toc.svelte';

  let { data } = $props();
</script>

<svelte:head><title>{data.title} · ZEIT Game Components</title></svelte:head>

<main class="site-main" id="inhalt">
  <div class="crumb">Guides</div>
  <h1>{data.title}</h1>
  <!-- Markdown from the repo (trusted), rendered at build time. -->
  <article class="prose-long">{@html data.html}</article>
  <nav class="pager" aria-label="Guides">
    {#if data.prev}<a class="page-card" href={resolve('/guides/[slug]', { slug: data.prev.slug })}><span>← Previous</span><strong>{data.prev.title}</strong></a>{:else}<span></span>{/if}
    {#if data.next}<a class="page-card pager__next" href={resolve('/guides/[slug]', { slug: data.next.slug })}><span>Next →</span><strong>{data.next.title}</strong></a>{/if}
  </nav>
</main>

<aside class="site-rail" aria-label="On this page">
  <div>
    {#if data.toc.length}
      <div>
        <p class="rail-title">On this page</p>
        {#key data.title}<Toc items={data.toc} />{/key}
      </div>
    {/if}
  </div>
</aside>

<style>
  .pager {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    max-width: 72ch;
    margin-top: 56px;
  }
  .pager__next {
    text-align: right;
  }
</style>
