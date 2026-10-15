<!--
  Sudoku ⇄ Wortgeflecht: two landing pages and a fake game screen built from the same
  components, the way a SvelteKit game would use them. Everything game-specific
  (artwork, labels, colours, content) comes from games-data.js.

  - Strings and booleans are attributes, structured data goes through {@attach props()},
    events are on<event-name> handlers.
  - The skeletons and the FAQ <details> are server-rendered into the prerendered HTML;
    the components are imported client-only (root layout). ?delay=2000 holds them back.
  - Routes are fake (#/<game>/<date>); nothing is fetched.
-->
<script>
  import { onMount, tick } from 'svelte';
  import { connectTracking } from '@zeitonline/game-components/tracking';
  import { resolve } from '$app/paths';
  import { GAMES } from '$lib/games-data.js';
  import { props } from '$lib/props.js';

  /** @typedef {typeof GAMES.sudoku} Game */

  /** @type {Game} */
  let game = $state(GAMES.sudoku);
  /** @type {Record<string, 'started' | 'concluded'>} */
  let progress = $state({});
  let today = $state('');
  /** @type {string | undefined} */
  let currentDate = $state();
  let solved = $state(false);
  /** @type {{ summary: string, shareText: string, stats: { label: string, value: string | number, record?: boolean }[] } | null} */
  let result = $state(null);
  let toast = $state('');

  /** @type {any} */ let timer = $state();
  /** @type {any} */ let rules = $state();
  /** @type {any} */ let instructions = $state();
  /** @type {any} */ let archive = $state();
  /** @type {any} */ let moreMenu = $state();

  const iso = (/** @type {Date} */ d) => d.toISOString().slice(0, 10);
  const daysAgo = (/** @type {number} */ n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return iso(d);
  };
  const href = (/** @type {string} */ date) => `#/${game.id}/${date}`;
  const progressKey = () => `zon-demo-${game.id}`;
  const rulesKey = () => `${progressKey()}-rules`;

  function loadProgress() {
    try {
      progress = JSON.parse(sessionStorage.getItem(progressKey()) || '{}');
    } catch {
      progress = {};
    }
  }
  function saveProgress() {
    try {
      sessionStorage.setItem(progressKey(), JSON.stringify(progress));
    } catch {}
  }
  function markRulesSeen() {
    try {
      sessionStorage.setItem(rulesKey(), '1');
    } catch {}
  }
  const rulesSeen = () => {
    try {
      return Boolean(sessionStorage.getItem(rulesKey()));
    } catch {
      return false;
    }
  };

  // --- derived landing-page data -------------------------------------------
  const heroState = $derived(
    progress[today] === 'concluded' ? 'solved' : progress[today] === 'started' ? 'continue' : 'new',
  );
  const puzzle = (/** @type {number} */ n, extra = {}) => ({
    date: daysAgo(n),
    href: href(daysAgo(n)),
    status: progress[daysAgo(n)],
    ...extra,
  });
  const moreItems = $derived(today ? [1, 2, 3, 4].map((n) => puzzle(n)) : []);
  const archiveItems = $derived(
    today ? Array.from({ length: 10 }, (_, i) => puzzle(i + 1, i > 6 ? { status: 'locked' } : {})) : [],
  );
  // The artwork itself is the slotted element, so the hero can size it.
  const heroArt = $derived(game.heroArt.replace(/^<(\w+)/, '<$1 slot="image"'));
  const gameDate = $derived(
    currentDate
      ? `${game.name} · ${new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'short' }).format(new Date(currentDate + 'T12:00'))}`
      : '',
  );

  // --- toast ---------------------------------------------------------------
  /** @type {ReturnType<typeof setTimeout>} */
  let toastTimer;
  function notify(/** @type {string} */ message) {
    toast = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast = ''), 2500);
  }

  // --- tiny router -----------------------------------------------------------
  function route() {
    const m = location.hash.match(/^#\/(\w+)\/(\d{4}-\d{2}-\d{2})$/);
    if (m && m[1] === game.id) {
      openGame(m[2]);
      notify(`Navigation → /${game.id}/${m[2]} (fake)`);
    } else {
      currentDate = undefined;
      timer?.pause();
    }
    scrollTo(0, 0);
  }

  function openGame(/** @type {string} */ date) {
    currentDate = date;
    solved = false;
    result = null;
    if (!progress[date]) {
      progress[date] = 'started';
      saveProgress();
    }
    // The game screen is rendered now; wait for the timer to exist and be defined.
    tick().then(async () => {
      await customElements.whenDefined('zon-game-timer');
      timer.removeAttribute('disabled');
      timer.reset(0);
      timer.start();
      nav?.setDisabled('hint', false);
    });
  }

  async function solve() {
    // Imported lazily: the module defines the element class, which needs the browser.
    const { formatTime } = await import('@zeitonline/game-components/timer');
    timer.pause();
    timer.setAttribute('disabled', '');
    progress[/** @type {string} */ (currentDate)] = 'concluded';
    saveProgress();
    const time = formatTime(timer.elapsed);
    const count = Object.values(progress).filter((s) => s === 'concluded').length;
    result =
      game.id === 'sudoku'
        ? {
            summary: `In <strong>${time}</strong> gelöst.`,
            shareText: `ZEIT ${game.name} ${currentDate} ✅ ${time}`,
            stats: [
              { label: 'Zeit', value: time, record: true },
              { label: 'Gelöst', value: count },
            ],
          }
        : {
            summary: 'Alle Themenwörter gefunden.',
            shareText: `ZEIT ${game.name} ${currentDate} ✅ ${time}`,
            stats: [
              { label: 'Wörter', value: 7 },
              { label: 'Hinweise', value: 0 },
              { label: 'Gelöst', value: count },
            ],
          };
    solved = true;
  }

  // Game switch: same components, different attributes and data, no reload.
  function switchGame(/** @type {MouseEvent} */ e, /** @type {string} */ id) {
    e.preventDefault();
    if (id === game.id) return;
    game = GAMES[/** @type {keyof typeof GAMES} */ (id)];
    loadProgress();
    history.pushState(null, '', `?game=${game.id}#/`);
    route();
  }

  function toggleTheme() {
    const html = document.documentElement.classList;
    const dark = !html.contains('color-scheme-dark');
    html.toggle('color-scheme-dark', dark);
    html.toggle('color-scheme-light', !dark);
    dispatchEvent(new CustomEvent('colorscheme', { detail: dark ? 'dark' : 'light' }));
  }

  // --- in-game navigation callbacks -----------------------------------------
  /** @type {any} */ let nav = $state();
  const handlers = {
    // Runs before the default action; returning false would cancel it.
    back: () => timer?.pause(),
    hint: (/** @type {{ navigation: any }} */ { navigation }) => {
      notify('Tipp eingelöst (Demo) – ein Buchstabe wird markiert.');
      navigation.setDisabled('hint', true); // one tip per puzzle, like Wortgeflecht
    },
    more: () => console.info('more clicked – default action opens #more-menu'),
  };

  onMount(() => {
    const fromUrl = () => GAMES[/** @type {keyof typeof GAMES} */ (new URLSearchParams(location.search).get('game'))] ?? GAMES.sudoku;
    game = fromUrl();
    today = daysAgo(0);
    loadProgress();
    route();

    const stopTracking = connectTracking({ map: (p) => ({ ...p, game: { name: game.id, episode: currentDate ?? today } }) });
    const logTrack = (/** @type {Event} */ e) => console.info('[dataLayer]', /** @type {CustomEvent} */ (e).detail);
    const onPop = () => {
      game = fromUrl();
      loadProgress();
      route();
    };
    document.addEventListener('zon-track', logTrack);
    addEventListener('hashchange', route);
    addEventListener('popstate', onPop);
    return () => {
      stopTracking();
      document.removeEventListener('zon-track', logTrack);
      removeEventListener('hashchange', route);
      removeEventListener('popstate', onPop);
    };
  });
</script>

<svelte:head><title>{game.name} · Demo</title></svelte:head>

<div class="frame-bar">
  <a class="brand" href={resolve('/')}>← Docs</a>
  <nav class="game-switch" aria-label="Spiel wählen">
    {#each Object.values(GAMES) as g (g.id)}
      <a href="?game={g.id}" aria-current={g.id === game.id ? 'page' : undefined} onclick={(e) => switchGame(e, g.id)}>{g.name}</a>
    {/each}
  </nav>
  <button class="theme" type="button" onclick={toggleTheme}>Dark mode</button>
</div>

{#if !currentDate}
  <!-- Landing page (route "#/") -->
  <main>
    <zon-game-hero
      heading-level="1"
      category={game.category}
      game-name={game.name}
      date={today || undefined}
      href={today ? href(today) : undefined}
      state={heroState}
      badge-label={game.hero.badge[heroState]}
      cta-label={game.hero.cta[heroState]}
      style:--zon-hero-art-width={game.heroArtWidth?.[0]}
      style:--zon-hero-art-width-wide={game.heroArtWidth?.[1]}
      onzon-start={(/** @type {CustomEvent} */ e) => {
        if (e.detail.state === 'new' && !rulesSeen()) {
          // First visit: show the rules before the first puzzle (both games do this).
          e.preventDefault();
          instructions.step = 0;
          rules.show();
        } else if (e.detail.state === 'solved' && game.id === 'wortgeflecht') {
          // Wortgeflecht's banner turns into "Weitere Rätsel" once solved and opens the archive.
          e.preventDefault();
          archive.show();
        }
      }}
    >
      <div class="zon-skeleton zon-skeleton--hero" data-category={game.category} aria-hidden="true">
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
      <!-- Artwork from games-data.js (trusted). -->
      {@html heroArt}
    </zon-game-hero>

    <zon-puzzle-list
      category={game.category}
      heading={game.listHeading}
      game-name={game.name}
      {@attach props({ items: moreItems, icon: game.tileIcon })}
      onzon-show-all={(/** @type {CustomEvent} */ e) => {
        e.preventDefault();
        archive.show();
      }}
    >
      <div class="zon-skeleton zon-skeleton--puzzle-list" data-category={game.category} aria-hidden="true">
        <div class="zon-skeleton__head">
          <span class="zon-skeleton__bone zon-skeleton__heading"></span>
          <span class="zon-skeleton__bone zon-skeleton__all"></span>
        </div>
        <ul>
          {#each [1, 2, 3, 4] as n (n)}
            <li><span class="zon-skeleton__bone zon-skeleton__tile"></span><span class="zon-skeleton__lines"><span class="zon-skeleton__bone zon-skeleton__supporter"></span><span class="zon-skeleton__bone zon-skeleton__date"></span></span></li>
          {/each}
        </ul>
      </div>
    </zon-puzzle-list>

    <!-- Server-rendered <details>: crawlable and usable before any script. Recreated per
         game, so the component re-reads the markup for its JSON-LD. -->
    {#key game.id}
      <zon-game-faq structured-data exclusive>
        {#each game.faq as item, i (item.question)}
          <details open={i === 0}>
            <summary><h2>{item.question}</h2></summary>
            <div class="zon-faq__answer">{@html item.answer}</div>
          </details>
        {/each}
      </zon-game-faq>
    {/key}
  </main>
{:else}
  <!-- Fake game page (route "#/<game>/<date>") -->
  <main class="game-page">
    <!-- back = link, archive / more = open dialogs by id, theme = built-in, hint / print = callbacks. -->
    <zon-game-navigation
      bind:this={nav}
      heading={game.nav.heading}
      end-actions={game.nav.end}
      back-href="#/"
      archive-dialog="archive"
      more-dialog="more-menu"
      {@attach props({ handlers, customActions: game.nav.custom ?? [] })}
      onzon-theme-change={(/** @type {CustomEvent} */ e) => notify(`Farbschema: ${e.detail.scheme}`)}
    ></zon-game-navigation>

    <section class="game" hidden={solved}>
      <div class="game-meta">
        <span>{gameDate}</span>
        <zon-game-timer bind:this={timer} pause-when-hidden></zon-game-timer>
      </div>
      <div class="board" data-game={game.id} aria-label="Spielfeld (Attrappe)">
        {#if game.id === 'sudoku'}
          {#each Array.from({ length: 81 }, (_, i) => i) as i (i)}
            <span>{(i * 7) % 11 < 3 ? ((i * 5) % 9) + 1 : ''}</span>
          {/each}
        {:else}
          {#each Array.from({ length: 48 }, (_, i) => i) as i (i)}
            <span class:found={i < 6}>{'GEFLECHTWORTRAETSELSPIELZEITONLINEHERBSTLAUBKASTANIEN'[i % 52]}</span>
          {/each}
        {/if}
      </div>
      <button class="solve" type="button" onclick={solve}>Rätsel lösen (Demo)</button>
    </section>

    {#if result}
      <zon-game-result
        heading={game.resultHeading}
        share-text={result.shareText}
        {@attach props({ stats: result.stats })}
        onzon-primary={() => {
          const next = [1, 2, 3, 4, 5, 6].map(daysAgo).find((d) => progress[d] !== 'concluded');
          location.hash = next ? href(next) : '#/';
        }}
        onzon-secondary={() => openGame(/** @type {string} */ (currentDate))}
      >
        <p slot="summary">{@html result.summary}</p>
      </zon-game-result>
    {/if}
  </main>
{/if}

<zon-game-dialog id="rules" variant="wide" label="Spielregeln" bind:this={rules}>
  <zon-game-instructions
    bind:this={instructions}
    {@attach props({ steps: game.steps })}
    onzon-complete={() => {
      markRulesSeen();
      location.hash = href(today);
    }}
    onzon-skip={() => {
      markRulesSeen();
      location.hash = href(today);
    }}
  ></zon-game-instructions>
</zon-game-dialog>

<zon-game-dialog id="archive" variant="drawer" bind:this={archive}>
  <h2 slot="title">Alle {game.name} Rätsel</h2>
  <zon-puzzle-list
    heading="Oktober 2026"
    columns="1"
    all-label=""
    category={game.category}
    game-name={game.name}
    {@attach props({ items: archiveItems, icon: game.tileIcon })}
    onzon-puzzle-select={(/** @type {CustomEvent} */ e) => {
      if (e.detail.item.status === 'locked') {
        e.preventDefault();
        notify('Hier würde die Paywall erscheinen (Z+).');
        return;
      }
      archive.close('navigate');
    }}
  ></zon-puzzle-list>
</zon-game-dialog>

<zon-game-dialog id="more-menu" variant="drawer" bind:this={moreMenu}>
  <h2 slot="title">Mehr</h2>
  <div class="more-links">
    <button
      type="button"
      onclick={() => {
        moreMenu.close('navigate');
        instructions.step = 0;
        rules.show();
      }}>Spielregeln</button
    >
    <button
      type="button"
      onclick={() => {
        moreMenu.close('navigate');
        openGame(/** @type {string} */ (currentDate));
        notify('Rätsel zurückgesetzt');
      }}>Rätsel zurücksetzen</button
    >
  </div>
</zon-game-dialog>

<div class="toast" role="status" hidden={!toast}>{toast}</div>

<style>
  :global(body) {
    font-family: system-ui, sans-serif;
  }
  .frame-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background: var(--z-ds-color-background-0);
    border-bottom: 1px solid var(--z-ds-color-border-70);
  }
  .brand {
    font-weight: 800;
    color: inherit;
  }
  .game-switch {
    display: inline-flex;
    padding: 3px;
    gap: 2px;
    border-radius: 999px;
    background: var(--z-ds-color-background-10);
  }
  .game-switch a {
    padding: 6px 14px;
    border-radius: 999px;
    text-decoration: none;
    color: inherit;
    font-weight: 600;
    font-size: 14px;
  }
  .game-switch a[aria-current='page'] {
    background: var(--z-ds-color-background-0);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  }
  .theme {
    font-size: 14px;
    background: none;
    border: 1px solid #999;
    border-radius: 8px;
    padding: 6px 10px;
  }
  /* Same content width as sudoku.zeit.de (--app-width: 888px). */
  main {
    max-width: 888px;
    margin: 0 auto;
    padding: 24px 16px 48px;
    display: grid;
    gap: 40px;
  }
  .game-page {
    gap: 16px;
    padding-top: 8px;
  }
  .game {
    display: grid;
    gap: 24px;
    justify-items: center;
  }
  .game[hidden] {
    display: none;
  }
  .game-meta {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    color: var(--z-ds-color-text-55);
  }
  .more-links {
    display: grid;
    gap: 8px;
  }
  .more-links button {
    text-align: left;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid var(--z-ds-color-border-70);
    background: none;
  }
  .board {
    width: min(100%, 360px);
    aspect-ratio: 1;
    display: grid;
  }
  .board[data-game='sudoku'] {
    grid-template-columns: repeat(9, 1fr);
    border: 3px solid currentColor;
  }
  .board[data-game='sudoku'] span {
    border: 1px solid #999;
    display: grid;
    place-items: center;
    font-weight: 700;
  }
  .board[data-game='sudoku'] span:nth-child(3n):not(:nth-child(9n)) {
    border-right: 2px solid currentColor;
  }
  .board[data-game='sudoku'] span:nth-child(n + 19):nth-child(-n + 27),
  .board[data-game='sudoku'] span:nth-child(n + 46):nth-child(-n + 54) {
    border-bottom: 2px solid currentColor;
  }
  .board[data-game='wortgeflecht'] {
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
    aspect-ratio: 6 / 8;
    width: min(100%, 300px);
  }
  .board[data-game='wortgeflecht'] span {
    display: grid;
    place-items: center;
    border-radius: 50%;
    aspect-ratio: 1;
    font-weight: 700;
    font-size: 20px;
    text-transform: uppercase;
  }
  .board[data-game='wortgeflecht'] span.found {
    background: #d6d5f4;
    color: #252525;
  }
  .solve {
    font-weight: 700;
    padding: 12px 24px;
    border: 0;
    border-radius: 8px;
    background: #000;
    color: #fff;
  }
  .toast {
    position: fixed;
    left: 50%;
    bottom: 16px;
    translate: -50% 0;
    max-width: calc(100% - 32px);
    background: #252525;
    color: #fff;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
  }
  .toast[hidden] {
    display: none;
  }
</style>
