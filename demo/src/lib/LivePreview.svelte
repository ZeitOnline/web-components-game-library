<!-- Small, inert live render of a component for the overview cards. -->
<script>
  import { onMount } from 'svelte';
  import { mount } from './markup.js';

  /** @type {{ component: import('./components/types').ComponentDef }} */
  let { component } = $props();
  /** @type {HTMLElement | undefined} */
  let host = $state();

  onMount(() => {
    if (!component.card && host) mount(host, component, $state.snapshot(component.playground.values));
  });
</script>

<div class="stage card__stage" inert>
  {#if component.card}
    <!-- Static preview from the definition (trusted). -->
    {@html component.card}
  {:else}
    <div class="preview" class:preview--center={component.playground.layout !== 'fill'} style:zoom={component.cardZoom ?? 1} bind:this={host}></div>
  {/if}
</div>

<style>
  .card__stage {
    align-items: flex-start;
  }
  .preview {
    width: 100%;
  }
  .preview--center {
    display: flex;
    justify-content: center;
    align-self: center;
  }
</style>
