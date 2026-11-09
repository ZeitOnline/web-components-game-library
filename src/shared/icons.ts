/** Inline SVG icons (currentColor, decorative). Same approach as Wortgeflecht's icon components. */
const svg = (body: string, size = 20): string =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

const filled18 = (body: string, size = 18): string =>
  `<svg width="${size}" height="${size}" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true" focusable="false">${body}</svg>`;

export const icons = {
  close: (s?: number) => svg('<path d="M6 6l12 12M18 6L6 18"/>', s),
  chevronLeft: (s?: number) => svg('<path d="M15 6l-6 6 6 6"/>', s),
  // Filled play / pause from sudoku `assets/icons/commons/play.svg` / `pause.svg` (18×18 grid).
  play: (s?: number) => filled18('<path d="M17 9L4 16L4 2L17 9Z"/>', s),
  pause: (s?: number) => filled18('<path fill-rule="evenodd" clip-rule="evenodd" d="M8 2H4V16H8V2ZM14 2H10V16H14V2Z"/>', s),
  share: (s?: number) => svg('<path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6"/>', s),
  chevronRight: (s?: number) => svg('<path d="M9 6l6 6-6 6"/>', s),
  party: (s?: number) =>
    svg('<path d="M4 20l5-14 9 9z"/><path d="M14 4l1 2M19 9l2-1M17 3l-1 3M20 6l-3 1"/>', s),
};

/** Status badges from sudoku `assets/icons/done-badge.svg` / `pause-badge.svg`. */
export const statusBadges: Readonly<Partial<Record<string, string>>> = {
  concluded: `<svg width="18" height="18" aria-hidden="true" focusable="false" viewBox="0 0 18 19" fill="none"><rect y="0.0361328" width="18" height="18" rx="9" fill="white"/><path d="M9 18.0361C13.9706 18.0361 18 14.0067 18 9.03613C18 4.06557 13.9706 0.0361328 9 0.0361328C4.02944 0.0361328 0 4.06557 0 9.03613C0 14.0067 4.02944 18.0361 9 18.0361ZM12.7864 7.42252L8.73642 11.4725C8.38496 11.824 7.81511 11.824 7.46363 11.4726L5.66361 9.67255C5.31213 9.32108 5.31213 8.75123 5.6636 8.39976C6.01507 8.04828 6.58492 8.04828 6.93639 8.39975L8.10002 9.56336L11.5136 6.14974C11.8651 5.79827 12.4349 5.79826 12.7864 6.14973C13.1379 6.5012 13.1379 7.07105 12.7864 7.42252Z" fill="#09864D"/></svg>`,
  started: `<svg width="18" height="18" aria-hidden="true" focusable="false" viewBox="0 0 18 19" fill="none"><path d="M0 9.03613C0 4.06557 4.02944 0.0361328 9 0.0361328C13.9706 0.0361328 18 4.06557 18 9.03613C18 14.0067 13.9706 18.0361 9 18.0361C4.02944 18.0361 0 14.0067 0 9.03613Z" fill="white"/><path d="M9 0.0361328C13.9706 0.0361329 18 4.06557 18 9.03613C18 14.0067 13.9706 18.0361 9 18.0361C4.02944 18.0361 1.28855e-07 14.0067 0 9.03613C0 4.06557 4.02944 0.0361328 9 0.0361328ZM7.2002 5.43652C6.70329 5.43663 6.29991 5.83904 6.2998 6.33594V11.7363C6.30012 12.233 6.70342 12.6356 7.2002 12.6357C7.69697 12.6356 8.09929 12.233 8.09961 11.7363V6.33594C8.0995 5.83904 7.6971 5.43663 7.2002 5.43652ZM10.7998 5.43652C10.303 5.43673 9.9005 5.8391 9.90039 6.33594V11.7363C9.90071 12.233 10.3031 12.6355 10.7998 12.6357C11.2967 12.6357 11.6999 12.2331 11.7002 11.7363V6.33594C11.7001 5.83897 11.2968 5.43652 10.7998 5.43652Z" fill="#005FCC"/></svg>`,
};

/* Icons copied from sudoku assets/icons (commons/chevron-left, commons/date,
   commons/ellipsis, sun, moon) and Wortgeflecht LightBulbIcon.svelte. */
const navIcons = {
  back: `<svg width="17" height="17" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.46966 6.46967L9.46966 0.469666L10.5303 1.53033L5.06065 7L10.5303 12.4697L9.46966 13.5303L3.46966 7.53033L2.93933 7L3.46966 6.46967Z" fill="currentColor"/></svg>`,
  archive: `<svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.25 1C5.66421 1 6 1.33579 6 1.75V3.25H12V1.75C12 1.33579 12.3358 1 12.75 1C13.1642 1 13.5 1.33579 13.5 1.75V3.25H15C15.9665 3.25 16.75 4.0335 16.75 5V14C16.75 14.9665 15.9665 15.75 15 15.75H6.5H3C2.0335 15.75 1.25 14.9665 1.25 14V5C1.25 4.0335 2.0335 3.25 3 3.25H4.5V1.75C4.5 1.33579 4.83579 1 5.25 1ZM6 4.75H12V5.25C12 5.66421 12.3358 6 12.75 6C13.1642 6 13.5 5.66421 13.5 5.25V4.75H15C15.1381 4.75 15.25 4.86193 15.25 5V7.5H2.75V5C2.75 4.86193 2.86193 4.75 3 4.75H4.5V5.25C4.5 5.66421 4.83579 6 5.25 6C5.66421 6 6 5.66421 6 5.25V4.75ZM2.75 9V14C2.75 14.1381 2.86193 14.25 3 14.25H6.5H15C15.1381 14.25 15.25 14.1381 15.25 14V9H2.75Z" fill="currentColor"/></svg>`,
  more: `<svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><circle cx="9" cy="9" r="1.5" fill="currentColor"/><circle cx="4" cy="9" r="1.5" fill="currentColor"/><circle cx="14" cy="9" r="1.5" fill="currentColor"/></svg>`,
  sun: `<svg width="18" height="18" viewBox="0 0 19 18" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.25 3.5V1H8.75V3.5H10.25ZM3.31282 3.87348L5.08058 5.64124L6.14124 4.58058L4.37348 2.81282L3.31282 3.87348ZM14.6265 2.8133L12.8588 4.58107L13.9194 5.64173L15.6872 3.87396L14.6265 2.8133ZM4 8.25H1.5V9.75H4V8.25ZM17.5 8.25H15V9.75H17.5V8.25ZM12.8588 13.4194L14.6265 15.1872L15.6872 14.1265L13.9194 12.3588L12.8588 13.4194ZM5.08058 12.3592L3.31282 14.127L4.37348 15.1877L6.14124 13.4199L5.08058 12.3592ZM10.25 17V14.5H8.75V17H10.25ZM7 9C7 7.61929 8.11929 6.5 9.5 6.5C10.8807 6.5 12 7.61929 12 9C12 10.3807 10.8807 11.5 9.5 11.5C8.11929 11.5 7 10.3807 7 9ZM9.5 5C7.29086 5 5.5 6.79086 5.5 9C5.5 11.2091 7.29086 13 9.5 13C11.7091 13 13.5 11.2091 13.5 9C13.5 6.79086 11.7091 5 9.5 5Z" fill="currentColor"/></svg>`,
  moon: `<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><mask id="moon-mask" fill="white"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.76768 1.09424C3.93448 1.6869 1 5.00071 1 8.99991C1 13.4182 4.58172 16.9999 9 16.9999C13.3022 16.9999 16.8113 13.6039 16.9926 9.34629C14.6499 10.9155 11.688 11.0469 9.5141 9.43643C7.04066 7.60409 6.39245 4.11328 7.76768 1.09424Z"/></mask><path d="M7.76768 1.09424L9.13273 1.71605L10.2846 -0.812738L7.53848 -0.388148L7.76768 1.09424ZM16.9926 9.34629L18.4913 9.41014L18.6173 6.4527L16.1579 8.10003L16.9926 9.34629ZM9.5141 9.43643L8.62121 10.6417L9.5141 9.43643ZM2.5 8.99991C2.5 5.75194 4.88369 3.05796 7.99687 2.57662L7.53848 -0.388148C2.98527 0.315835 -0.5 4.24948 -0.5 8.99991H2.5ZM9 15.4999C5.41015 15.4999 2.5 12.5898 2.5 8.99991H-0.5C-0.5 14.2466 3.75329 18.4999 9 18.4999V15.4999ZM15.494 9.28245C15.3467 12.7406 12.4952 15.4999 9 15.4999V18.4999C14.1093 18.4999 18.2758 14.4671 18.4913 9.41014L15.494 9.28245ZM16.1579 8.10003C14.2477 9.37951 11.9861 9.40091 10.407 8.23113L8.62121 10.6417C11.39 12.6928 15.0522 12.4514 17.8274 10.5926L16.1579 8.10003ZM10.407 8.23113C8.60866 6.89892 7.99233 4.21956 9.13273 1.71605L6.40263 0.472431C4.79256 4.007 5.47266 8.30927 8.62121 10.6417L10.407 8.23113Z" fill="currentColor" mask="url(#moon-mask)"/></svg>`,
  hint: `<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10 9.3335C10.1333 8.66683 10.4667 8.20016 11 7.66683C11.6667 7.06683 12 6.20016 12 5.3335C12 4.27263 11.5786 3.25521 10.8284 2.50507C10.0783 1.75492 9.06087 1.3335 8 1.3335C6.93913 1.3335 5.92172 1.75492 5.17157 2.50507C4.42143 3.25521 4 4.27263 4 5.3335C4 6.00016 4.13333 6.80016 5 7.66683C5.46667 8.1335 5.86667 8.66683 6 9.3335"/><path d="M6 12H10"/><path d="M6.66602 14.6665H9.33268"/></svg>`,
};

/**
 * Ready-made icons for buttons: <zon-game-button icon="archive">, the navigation's built-in
 * actions and the dialog's close button. All ~18px, currentColor, decorative.
 */
const templates = {
  ...navIcons,
  close: icons.close(18),
  play: icons.play(18),
  pause: icons.pause(18),
  share: icons.share(18),
  print: svg('<path d="M6 9V3h12v6"/><rect x="6" y="14" width="12" height="7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>', 17),
};

/** Names of the ready-made icons, e.g. for `<zon-game-button icon="…">`. */
export type IconName = keyof typeof templates;

export const iconTemplates: Readonly<Record<IconName, string>> = templates;

export function isIconName(name: string | null | undefined): name is IconName {
  return name != null && Object.prototype.hasOwnProperty.call(templates, name);
}
