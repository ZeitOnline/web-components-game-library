<!--
  Copy button with a short confirmation, as text in the button AND in a live region,
  so the success is not silent for screen readers.
-->
<script>
  /** @type {{ text: string, label?: string, class?: string, children?: import('svelte').Snippet }} */
  let { text, label = 'Copy', class: className = '', children } = $props();
  let copied = $state(false);
  /** @type {ReturnType<typeof setTimeout>} */
  let timer;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // No clipboard permission (e.g. embedded): only the confirmation is shown.
    }
    copied = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied = false), 1400);
  }
</script>

<button type="button" class={className} onclick={copy}>
  {@render children?.()}
  <small>{copied ? 'Copied' : label}</small>
</button>
<span class="sr-only" role="status">{copied ? 'Copied to clipboard' : ''}</span>
