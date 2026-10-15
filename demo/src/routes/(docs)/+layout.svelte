<script>
  import { afterNavigate } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { byCategory } from '$lib/components/index.js';
  import pkg from '../../../../package.json';

  let { data, children } = $props();
  const groups = byCategory();
  const inGuides = $derived(page.url.pathname.startsWith('/guides'));

  // Side navigation on small screens: collapsible, closed after each navigation.
  let sideOpen = $state(false);
  afterNavigate(() => (sideOpen = false));

  /** @param {string} href */
  const current = (href) => (page.url.pathname === href ? 'page' : undefined);

  function toggleTheme() {
    const root = document.documentElement;
    const isDark =
      root.classList.contains('color-scheme-dark') ||
      (!root.classList.contains('color-scheme-light') && matchMedia('(prefers-color-scheme: dark)').matches);
    const scheme = isDark ? 'light' : 'dark';
    root.classList.toggle('color-scheme-dark', scheme === 'dark');
    root.classList.toggle('color-scheme-light', scheme === 'light');
    try {
      localStorage.setItem('color-scheme', scheme);
    } catch {
      // Without storage the choice lasts until reload.
    }
    // The frame's signal: <zon-game-navigation> syncs its theme switch with it.
    dispatchEvent(new CustomEvent('colorscheme', { detail: scheme }));
  }
</script>

<a class="sr-only" href="#inhalt">Skip to content</a>
<header class="site-header">
  <a class="site-logo" href={resolve('/')}><b>ZEIT</b> Game Components <span>v{pkg.version}</span></a>
  <nav class="site-nav" aria-label="Sections">
    <a href={resolve('/')} aria-current={!inGuides ? 'page' : undefined}>Components</a>
    <a href={resolve('/guides/[slug]', { slug: 'getting-started' })} aria-current={inGuides ? 'page' : undefined}>Guides</a>
    <a href={resolve('/games')}>Game demo</a>
  </nav>
  <button type="button" class="theme-toggle" aria-label="Toggle light / dark" onclick={toggleTheme}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"
      ><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg
    >
  </button>
</header>

<div class="site-shell">
  <button type="button" class="side-toggle" aria-expanded={sideOpen} aria-controls="side-menu" onclick={() => (sideOpen = !sideOpen)}>
    Menu
  </button>
  <nav id="side-menu" class="site-side" class:is-open={sideOpen} aria-label="Documentation">
    <h3>Start</h3>
    <a href={resolve('/')} aria-current={current('/')}>Overview</a>
    <a href={resolve('/games')}>Game demo <small>Sudoku ⇄ Wortgeflecht</small></a>

    {#each groups as { category, components } (category)}
      <h3>{category}</h3>
      {#each components as c (c.slug)}
        {@const href = resolve('/components/[slug]', { slug: c.slug })}
        <a {href} aria-current={current(href)}>{c.name} <small>&lt;{c.tag}&gt;</small></a>
      {/each}
    {/each}

    <h3>Guides</h3>
    {#each data.guides as g (g.slug)}
      {@const href = resolve('/guides/[slug]', { slug: g.slug })}
      <a {href} aria-current={current(href)}>{g.title}</a>
    {/each}
  </nav>
  {@render children()}
</div>
