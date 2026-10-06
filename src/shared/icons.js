/** Inline SVG icons (currentColor, decorative). Same approach as Wortgeflecht's icon components. */
const svg = (body, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

export const icons = {
  close: (s) => svg('<path d="M6 6l12 12M18 6L6 18"/>', s),
  chevronLeft: (s) => svg('<path d="M15 6l-6 6 6 6"/>', s),
  play: (s) => svg('<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>', s),
  pause: (s) => svg('<path d="M8 5v14M16 5v14"/>', s),
  share: (s) => svg('<path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6"/>', s),
  chevronRight: (s) => svg('<path d="M9 6l6 6-6 6"/>', s),
  party: (s) =>
    svg('<path d="M4 20l5-14 9 9z"/><path d="M14 4l1 2M19 9l2-1M17 3l-1 3M20 6l-3 1"/>', s),
};

/** Status badges from sudoku `assets/icons/done-badge.svg` / `pause-badge.svg`. */
export const statusBadges = {
  concluded: `<svg width="18" height="18" aria-hidden="true" focusable="false" viewBox="0 0 18 19" fill="none"><rect y="0.0361328" width="18" height="18" rx="9" fill="white"/><path d="M9 18.0361C13.9706 18.0361 18 14.0067 18 9.03613C18 4.06557 13.9706 0.0361328 9 0.0361328C4.02944 0.0361328 0 4.06557 0 9.03613C0 14.0067 4.02944 18.0361 9 18.0361ZM12.7864 7.42252L8.73642 11.4725C8.38496 11.824 7.81511 11.824 7.46363 11.4726L5.66361 9.67255C5.31213 9.32108 5.31213 8.75123 5.6636 8.39976C6.01507 8.04828 6.58492 8.04828 6.93639 8.39975L8.10002 9.56336L11.5136 6.14974C11.8651 5.79827 12.4349 5.79826 12.7864 6.14973C13.1379 6.5012 13.1379 7.07105 12.7864 7.42252Z" fill="#09864D"/></svg>`,
  started: `<svg width="18" height="18" aria-hidden="true" focusable="false" viewBox="0 0 18 19" fill="none"><path d="M0 9.03613C0 4.06557 4.02944 0.0361328 9 0.0361328C13.9706 0.0361328 18 4.06557 18 9.03613C18 14.0067 13.9706 18.0361 9 18.0361C4.02944 18.0361 0 14.0067 0 9.03613Z" fill="white"/><path d="M9 0.0361328C13.9706 0.0361329 18 4.06557 18 9.03613C18 14.0067 13.9706 18.0361 9 18.0361C4.02944 18.0361 1.28855e-07 14.0067 0 9.03613C0 4.06557 4.02944 0.0361328 9 0.0361328ZM7.2002 5.43652C6.70329 5.43663 6.29991 5.83904 6.2998 6.33594V11.7363C6.30012 12.233 6.70342 12.6356 7.2002 12.6357C7.69697 12.6356 8.09929 12.233 8.09961 11.7363V6.33594C8.0995 5.83904 7.6971 5.43663 7.2002 5.43652ZM10.7998 5.43652C10.303 5.43673 9.9005 5.8391 9.90039 6.33594V11.7363C9.90071 12.233 10.3031 12.6355 10.7998 12.6357C11.2967 12.6357 11.6999 12.2331 11.7002 11.7363V6.33594C11.7001 5.83897 11.2968 5.43652 10.7998 5.43652Z" fill="#005FCC"/></svg>`,
};
