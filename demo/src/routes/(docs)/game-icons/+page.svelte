<script>
  import CopyButton from '$lib/CopyButton.svelte';
  import { GAME_CATALOG, sized } from '$lib/games.js';

  const CATEGORIES = [
    ['logic', 'Logic'],
    ['word', 'Word'],
    ['crossword', 'Crossword'],
    ['quiz', 'Quiz'],
    ['mini', 'Minigames'],
  ];
  const groups = CATEGORIES.map(([key, label]) => ({ key, label, games: GAME_CATALOG.filter((g) => g.category === key) })).filter(
    (g) => g.games.length,
  );
</script>

<svelte:head><title>Game icons · ZEIT Game Components</title></svelte:head>

<main class="site-main site-main--wide" id="inhalt">
  <div class="crumb">Foundations</div>
  <h1>Game icons</h1>
  <p class="lead">
    The logo and the 18×18 mini mark of every game, on its category colour. The playgrounds use them in the
    <code>game-name</code> select: the hero shows the logo, the puzzle list the mini mark at 36px.
  </p>
  <p class="meta">
    One file per game in <code>demo/content/games/&lt;id&gt;.yml</code>, with the SVGs as code. Edit a game with
    “Edit”, or add one in the CMS under <a href="/admin/index.html#/collections/games" data-sveltekit-reload>Games</a>.
  </p>

  {#each groups as group (group.key)}
    <section class="section" aria-labelledby="h-{group.key}">
      <h2 id="h-{group.key}">{group.label}</h2>
      <div class="icons">
        {#each group.games as g (g.id)}
          <article class="icon-card cat-{g.category}">
            <!-- SVGs from spielecp (trusted, generated file). -->
            <div class="icon-card__logo">{@html g.logo}</div>
            <div class="icon-card__body">
              <strong>{g.name}</strong>
              <span class="meta">{g.subcategory} · <code>{g.id}</code></span>
              <div class="icon-card__foot">
                <div class="icon-card__minis">
                  {#if g.mini}
                    <span class="mini mini--18" title="18 × 18 (frame navigation)">{@html sized(g.mini, 18)}</span>
                    <span class="mini mini--tile" title="36 × 36 tile (puzzle list)">{@html sized(g.mini, 36)}</span>
                  {:else}
                    <span class="meta">No mini mark: the logo is scaled down.</span>
                  {/if}
                </div>
                <div class="icon-card__actions">
                  <CopyButton text={g.logo} label="Copy logo" class="link-button" />
                  {#if g.mini}<CopyButton text={g.mini} label="Copy mini" class="link-button" />{/if}
                <a class="link-button edit" href="/admin/index.html#/collections/games/entries/{g.id}" data-sveltekit-reload>Edit</a>
                </div>
              </div>
            </div>
          </article>
        {/each}
      </div>
    </section>
  {/each}
</main>

<style>
  .icons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }
  .icon-card {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--site-border);
    border-radius: var(--site-radius);
    overflow: hidden;
  }
  /* Same colours as the components' `category` (frame tokens, live fallbacks). */
  .cat-logic { --base: var(--z-ds-color-games-logic-base, #fccdb6); --soft: var(--z-ds-color-games-logic-soft, #fae4d3); }
  .cat-word { --base: var(--z-ds-color-games-word-base, #d6d5f4); --soft: var(--z-ds-color-games-word-soft, #e6e7f7); }
  .cat-crossword { --base: var(--z-ds-color-games-crossword-base, #bbdef7); --soft: var(--z-ds-color-games-crossword-soft, #d9ecf9); }
  .cat-quiz { --base: var(--z-ds-color-games-quiz-base, #b3dddd); --soft: var(--z-ds-color-games-quiz-soft, #d7eeed); }
  .cat-mini { --base: var(--z-ds-color-games-mini-base, #d5e6be); --soft: var(--z-ds-color-games-mini-soft, #e6efde); }
  .icon-card__logo {
    display: grid;
    place-items: center;
    aspect-ratio: 5 / 3;
    background: var(--base);
    color: #252525;
  }
  .icon-card__logo :global(svg) {
    width: 96px;
    height: 96px;
  }
  .icon-card__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 14px 10px;
    border-top: 1px solid var(--site-border);
  }
  /* Icons and copy buttons sit at the bottom, so they line up across a row of cards. */
  .icon-card__foot {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: auto;
  }
  .icon-card__minis {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
  }
  .mini {
    display: inline-grid;
    place-items: center;
    color: #252525;
  }
  .mini--18 {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #fff;
    box-shadow: inset 0 0 0 1px var(--site-border);
  }
  .mini--tile {
    width: 44px;
    height: 44px;
    border-radius: 4px;
    background: var(--soft);
  }
  .icon-card__actions {
    display: flex;
    gap: 4px;
    margin-left: -8px;
  }
  .icon-card__actions :global(.link-button) {
    height: 28px;
    padding: 0 8px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--site-focus);
    font-size: 12px;
    font-weight: 600;
  }
  .icon-card__actions .edit {
    display: inline-flex;
    align-items: center;
    margin-left: auto;
  }
  .icon-card__actions :global(.link-button small) {
    font-size: inherit;
    color: inherit;
  }
</style>
