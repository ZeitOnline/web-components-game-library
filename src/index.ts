/** Registers all components. Import single files from `src/components/` to load only what a game needs. */
export { ZonGameButton } from './components/zon-game-button.js';
export { ZonGameDialog } from './components/zon-game-dialog.js';
export { ZonGameInstructions } from './components/zon-game-instructions.js';
export { ZonGameTimer, formatTime } from './components/zon-game-timer.js';
export { ZonGameResult } from './components/zon-game-result.js';
export { ZonGameHero } from './components/zon-game-hero.js';
export { ZonPuzzleList } from './components/zon-puzzle-list.js';
export { ZonGameFaq, faqStructuredData } from './components/zon-game-faq.js';
export { ZonGameNavigation } from './components/zon-game-navigation.js';
export { ZonGameFeedbackButton } from './components/zon-game-feedback-button.js';
export { connectTracking } from './tracking.js';

export type { IconName } from './shared/icons.js';
export type { ButtonVariant } from './components/zon-game-button.js';
export type { DialogCloseReason } from './components/zon-game-dialog.js';
export type { InstructionStep } from './components/zon-game-instructions.js';
export type { ResultStat, ShareMethod } from './components/zon-game-result.js';
export type { HeroState } from './components/zon-game-hero.js';
export type { PuzzleItem, PuzzleStatus } from './components/zon-puzzle-list.js';
export type { FaqItem } from './components/zon-game-faq.js';
export type { NavAction, NavContext, NavCustomAction, NavHandler, NavHandlers } from './components/zon-game-navigation.js';
export type { TrackingOptions } from './tracking.js';
