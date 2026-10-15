# Skeletons

Custom elements only render once their JavaScript has run. Until then, an empty tag takes no space: the page first shows the frame, then jumps when the hero and list appear. `critical.css` contains plain-HTML skeletons that paint immediately and have **the same size and breakpoints** as the components (checked at 375, 700 and 1000 px), so the swap doesn't move anything.

## Usage

Put the skeleton **inside** the component tag. Once the element is defined, the skeleton disappears by itself (the shadow root has no default slot):

```html
<zon-game-hero category="logic" …>
  <div class="zon-skeleton zon-skeleton--hero" data-category="logic" aria-hidden="true">
    <div class="zon-skeleton__card">
      <div class="zon-skeleton__image"></div>
      <div class="zon-skeleton__content">
        <span class="zon-skeleton__bone zon-skeleton__badge"></span>
        <span class="zon-skeleton__text">
          <span class="zon-skeleton__bone zon-skeleton__title"></span>
          <span class="zon-skeleton__bone zon-skeleton__date"></span>
        </span>
        <span class="zon-skeleton__bone zon-skeleton__cta"></span>
      </div>
    </div>
  </div>
</zon-game-hero>

<zon-puzzle-list …>
  <div class="zon-skeleton zon-skeleton--puzzle-list" data-category="logic" aria-hidden="true">
    <div class="zon-skeleton__head">
      <span class="zon-skeleton__bone zon-skeleton__heading"></span>
      <span class="zon-skeleton__bone zon-skeleton__all"></span>
    </div>
    <ul>
      <!-- one <li> per expected row (default 4) -->
      <li><span class="zon-skeleton__bone zon-skeleton__tile"></span><span class="zon-skeleton__lines"><span class="zon-skeleton__bone zon-skeleton__supporter"></span><span class="zon-skeleton__bone zon-skeleton__date"></span></span></li>
    </ul>
  </div>
</zon-puzzle-list>
```

## Per framework

- **Angular:** `<app-root>` stays empty until the app has started, so put the skeletons inside `<app-root>` in `index.html` (not in a component template). Angular replaces them with the real components when it starts.
- **SvelteKit:** server-render the skeleton markup inside the tags; the components are imported client-only. The [game demo](/games) does this.

## Options

- `data-category` picks the game colours like the components' `category` attribute.
- `--zon-skeleton-columns` mirrors `columns` on the list.
- `zon-skeleton--faq` (one `<div class="zon-skeleton__question">` per question) is only needed when the FAQ is rendered by JavaScript.

Try it: [/games?delay=2000](/games?delay=2000) holds the components back for 2 s.
