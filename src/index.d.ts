/** Minimal typings so TypeScript / svelte-check / Angular accept the imports. */
export declare class ZonGameDialog extends HTMLElement { open: boolean; show(): void; close(reason?: string): void; }
export declare class ZonGameInstructions extends HTMLElement {
  steps: Array<{ title: string; description?: string; descriptionTwo?: string; svg?: string; image?: string; imageAlt?: string }>;
  step: number;
  goTo(step: number): void;
}
export declare class ZonGameTimer extends HTMLElement {
  elapsed: number; readonly running: boolean;
  start(): void; pause(reason?: string): void; toggle(reason?: string): void; reset(ms?: number): void;
}
export declare class ZonGameResult extends HTMLElement {
  stats: Array<{ label: string; value: string | number; record?: boolean; badge?: string }>;
  share(): Promise<void>;
}
export declare class ZonGameHero extends HTMLElement {}
export interface PuzzleItem { date: string; href?: string; label?: string; status?: 'started' | 'concluded' | 'locked'; }
export declare class ZonPuzzleList extends HTMLElement { items: PuzzleItem[]; icon: string; }
export interface FaqItem { question: string; /** trusted HTML */ answer: string; open?: boolean; }
export declare class ZonGameFaq extends HTMLElement { items: FaqItem[]; readonly structuredData: Record<string, unknown>; }
export declare function faqStructuredData(items: FaqItem[]): Record<string, unknown>;
export type NavAction = 'back' | 'archive' | 'theme' | 'hint' | 'more';
export interface NavContext { action: string; event: Event; element: HTMLElement; navigation: ZonGameNavigation; }
export interface NavCustomAction {
  id: string; label: string; icon?: string; position?: 'start' | 'end';
  disabled?: boolean; haspopup?: boolean; onClick?: (ctx: NavContext) => unknown;
}
export declare class ZonGameNavigation extends HTMLElement {
  /** Return false from a handler to skip the default action. */
  handlers: Partial<Record<NavAction | string, (ctx: NavContext) => unknown>>;
  customActions: NavCustomAction[];
  setExpanded(action: string, expanded: boolean): void;
  setDisabled(action: string, disabled: boolean): void;
}
export declare function formatTime(ms: number): string;
export declare function connectTracking(options?: {
  target?: EventTarget;
  game?: Record<string, unknown>;
  map?: (payload: Record<string, unknown>, component?: string) => Record<string, unknown> | null | undefined;
}): () => void;

declare global {
  interface HTMLElementTagNameMap {
    'zon-game-dialog': ZonGameDialog;
    'zon-game-instructions': ZonGameInstructions;
    'zon-game-timer': ZonGameTimer;
    'zon-game-result': ZonGameResult;
    'zon-game-hero': ZonGameHero;
    'zon-puzzle-list': ZonPuzzleList;
    'zon-game-navigation': ZonGameNavigation;
    'zon-game-faq': ZonGameFaq;
  }
}
