# Frameworks

The components are standard custom elements, so they work in any framework. Three rules apply everywhere:

- **Attributes** for strings, numbers and booleans: `heading="Sudoku"`, `autostart`.
- **Properties** for structured data: `stats`, `items`, `steps`, `handlers`, `customActions`.
- **Events** are `CustomEvent`s that bubble and are composed. Their data is in `event.detail`.

## SvelteKit

Import the components on the client only: they extend `HTMLElement`, which does not exist during SSR. The server still renders the tags (and the skeletons inside them), and they upgrade once the script runs. This site does exactly that in its root layout.

```svelte
<!-- +layout.svelte -->
<script>
  import '@zeitonline/game-components/critical.css';
  import { onMount } from 'svelte';

  let { children } = $props();
  onMount(() => import('@zeitonline/game-components'));
</script>

{@render children()}
```

Svelte 5 sets **object** values (arrays, objects) as properties, even before the element is defined. Events use `on<event-name>`:

```svelte
<zon-game-result
  heading="Gut gemacht!"
  share-text={shareText}
  {stats}
  onzon-primary={() => goto(next)}
>
  <p slot="summary">In <strong>{time}</strong> gelöst.</p>
</zon-game-result>
```

**String properties** (like `icon` on `<zon-puzzle-list>`) are set as attributes until the element is defined. Use a small attachment that waits for the definition and re-runs when the values change:

```js
// $lib/props.js
export const props = (values) => (el) => {
  let active = true;
  customElements.whenDefined(el.localName).then(() => {
    if (active) Object.assign(el, values);
  });
  return () => (active = false);
};
```

```svelte
<zon-puzzle-list category="logic" {@attach props({ items, icon })}></zon-puzzle-list>
```

The [game demo](/games) uses this for all properties.

- **Slotting an `<svg>`:** Svelte's types don't allow `slot` on an `<svg>`. Wrap it: `<div slot="image"><svg>…</svg></div>`.
- **Width in flex layouts:** `zon-game-hero` and `zon-puzzle-list` take 100% of the available width. Put them in a container with the width you want.

## Angular

Import once in `main.ts` and allow custom elements in the components that use them:

```ts
// main.ts
import '@zeitonline/game-components/navigation';
import '@zeitonline/game-components/hero';

// component
@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <zon-game-navigation heading="Sudoku Leicht" back-href="/" (zon-nav)="onNav($event.detail.action)" />
    <zon-game-result [stats]="stats" (zon-primary)="next()" />
  `,
})
```

Property bindings (`[stats]`) set properties; event bindings (`(zon-primary)`) listen to the custom events. In zone.js apps every DOM event the component handles can trigger change detection: prefer zoneless or `OnPush`.

## Plain HTML

```html
<zon-game-timer autostart pause-when-hidden></zon-game-timer>

<script type="module">
  import '@zeitonline/game-components/timer';
  const timer = document.querySelector('zon-game-timer');
  timer.addEventListener('zon-timer-pause', (e) => console.log(e.detail.elapsed));
</script>
```

Each component page has these three variants in its playground's code tabs, generated from the current settings.
