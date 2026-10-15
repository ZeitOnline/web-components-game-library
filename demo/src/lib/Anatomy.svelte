<!--
  Anatomy: the shadow parts, numbered on the real rendering.

  The part names come from the definition; positions and sizes are MEASURED in the
  open shadow root (getBoundingClientRect), not entered by hand. When the component's
  CSS changes, the boxes move with it. Each part can be styled from outside with
  ::part(<name>).
-->
<script>
  import { onMount } from 'svelte';
  import { mount } from './markup.js';

  /** @type {{ component: import('./components/types').ComponentDef }} */
  let { component } = $props();
  // svelte-ignore state_referenced_locally
  const def = component;
  const parts = def.parts.map((p, i) => ({ ...p, nr: i + 1 }));

  /** @type {HTMLElement | undefined} */
  let stage = $state();
  /** @type {HTMLElement | undefined} */
  let host = $state();
  /** @type {({ nr: number, x: number, y: number, w: number, h: number, mx: number, my: number } | null)[]} */
  let boxes = $state([]);
  /** @type {number | null} */
  let active = $state(null);

  /** @param {HTMLElement} el */
  function measure(el) {
    if (!stage) return;
    const base = stage.getBoundingClientRect();
    boxes = parts.map((p) => {
      const node = el.shadowRoot?.querySelector(`[part~="${p.name}"]`);
      if (!node) return null;
      const r = node.getBoundingClientRect();
      if (!r.width && !r.height) return null;
      return { nr: p.nr, x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height, mx: -11, my: -11 };
    });
    // Markers dodge each other: corner by corner until none covers another.
    /** @type {{ x: number, y: number }[]} */
    const placed = [];
    for (const box of boxes) {
      if (!box) continue;
      const corners = [
        [-11, -11],
        [box.w - 11, -11],
        [box.w - 11, box.h - 11],
        [-11, box.h - 11],
      ];
      const free =
        corners.find(([dx, dy]) => placed.every((q) => Math.hypot(box.x + dx - q.x, box.y + dy - q.y) >= 26)) ??
        corners[0];
      [box.mx, box.my] = free;
      placed.push({ x: box.x + free[0], y: box.y + free[1] });
    }
  }

  onMount(() => {
    /** @type {ResizeObserver | undefined} */
    let observer;
    mount(/** @type {HTMLElement} */ (host), def, $state.snapshot(def.playground.values)).then((el) => {
      requestAnimationFrame(() => measure(el));
      observer = new ResizeObserver(() => measure(el));
      observer.observe(/** @type {HTMLElement} */ (stage));
      observer.observe(el);
      // Images (hero artwork) change the layout once loaded.
      el.querySelectorAll('img').forEach((img) => img.addEventListener('load', () => measure(el)));
    });
    return () => observer?.disconnect();
  });

  /** @param {number} nr */
  const size = (nr) => {
    const b = boxes.find((x) => x?.nr === nr);
    return b ? `${Math.round(b.w)} × ${Math.round(b.h)} px` : 'not rendered in this state';
  };
</script>

<div class="panel anatomy" class:anatomy--stacked={def.playground.layout === 'fill'}>
  <div class="stage stage--light anatomy__stage" bind:this={stage}>
    <div class="anatomy__render" inert bind:this={host}></div>
    {#each boxes as box, i (i)}
      {#if box}
        <span
          class="anatomy__box"
          class:is-active={active === box.nr}
          class:is-dimmed={active !== null && active !== box.nr}
          style:left="{box.x}px"
          style:top="{box.y}px"
          style:width="{box.w}px"
          style:height="{box.h}px"
          aria-hidden="true"
        >
          <span class="anatomy__marker" style:left="{box.mx}px" style:top="{box.my}px">{box.nr}</span>
        </span>
      {/if}
    {/each}
  </div>
  <ol class="anatomy__parts">
    {#each parts as p (p.nr)}
      <li onpointerenter={() => (active = p.nr)} onpointerleave={() => (active = null)}>
        <span class="anatomy__nr" aria-hidden="true">{p.nr}</span>
        <div>
          <div class="anatomy__head">
            <code>::part({p.name})</code>
            <span class="meta">{size(p.nr)}</span>
          </div>
          <p>{p.description}</p>
        </div>
      </li>
    {/each}
  </ol>
</div>

<style>
  .anatomy {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .anatomy__stage {
    position: relative;
    min-height: 240px;
    padding: 40px 32px;
    border-right: 1px solid var(--site-border);
  }
  .anatomy--stacked {
    grid-template-columns: minmax(0, 1fr);
  }
  .anatomy--stacked .anatomy__stage {
    border-right: 0;
    border-bottom: 1px solid var(--site-border);
  }
  .anatomy--stacked .anatomy__render {
    width: 100%;
  }
  .anatomy--stacked .anatomy__parts {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
  .anatomy__render {
    position: relative;
    z-index: 0;
  }
  .anatomy__box {
    position: absolute;
    z-index: 1;
    outline: 1.5px dashed var(--site-accent);
    pointer-events: none;
    transition: opacity 160ms var(--site-ease);
  }
  .anatomy__box.is-active {
    outline-style: solid;
    background: color-mix(in srgb, var(--site-accent) 8%, transparent);
  }
  .anatomy__box.is-dimmed {
    opacity: 0.2;
  }
  .anatomy__marker,
  .anatomy__nr {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background: var(--site-accent);
    color: #fff;
    font-family: var(--site-font);
    font-size: 11px;
    font-weight: 700;
  }
  .anatomy__marker {
    position: absolute;
  }
  .anatomy__parts {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .anatomy__parts > li {
    display: grid;
    grid-template-columns: 22px minmax(0, 1fr);
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--site-border);
    transition: background-color 160ms var(--site-ease);
  }
  .anatomy__parts > li:hover {
    background: var(--site-surface);
  }
  .anatomy__head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;
  }
  .anatomy__parts p {
    margin: 2px 0 0;
    font-size: 14px;
    color: var(--site-muted);
  }
  @media (max-width: 800px) {
    .anatomy {
      grid-template-columns: minmax(0, 1fr);
    }
    .anatomy__stage {
      border-right: 0;
      border-bottom: 1px solid var(--site-border);
    }
  }
</style>
