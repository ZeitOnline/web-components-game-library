<script>
  // Exactly what a SvelteKit game does: critical.css in the root layout (render-blocking,
  // skeletons + FAQ styles), the components imported on the client only, because they
  // extend HTMLElement, which does not exist during SSR.
  import '@zeitonline/game-components/critical.css';
  import '../app.css';
  import { onMount } from 'svelte';

  let { children } = $props();

  onMount(() => {
    // ?delay=<ms> holds the components back to show the skeletons, as on a slow connection.
    const delay = Number(new URLSearchParams(location.search).get('delay')) || 0;
    setTimeout(() => import('@zeitonline/game-components'), delay);
  });
</script>

{@render children()}
