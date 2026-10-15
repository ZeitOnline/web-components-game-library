<!-- "On this page" with the section currently in view highlighted. -->
<script>
  import { onMount } from 'svelte';

  /** @type {{ items: [string, string][] }} */
  let { items } = $props();
  let current = $state('');

  onMount(() => {
    const visible = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id);
        current = items.find(([id]) => visible.has(id))?.[0] ?? current;
      },
      { rootMargin: '-80px 0px -55% 0px' },
    );
    for (const [id] of items) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  });
</script>

<nav class="toc" aria-label="On this page">
  {#each items as [id, label] (id)}
    <a href="#{id}" class:is-active={current === id} aria-current={current === id ? 'location' : undefined}>{label}</a>
  {/each}
</nav>
