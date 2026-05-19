/**
 * Scroll journey and timing configuration for the About section.
 */

// Scroll spacer height representing 3.5 pages (350vh) of scroll journey
export const SCROLL_PAGES = 3.5;
export const TOTAL_SPACER_HEIGHT = SCROLL_PAGES * 100;

// Title transition thresholds (Stage 1)
export const TITLE_ENTRANCE_END = 0.05;
export const TITLE_EXIT_START = 0.12;
export const TITLE_EXIT_END = 0.2;

// Terminal section transitions
export const LAYOUT_TIMING_OPACITY = [0.2, 0.25, 0.95, 0.99];
export const LAYOUT_TIMING_Y = [0.2, 0.25];

// Scroll hint transition timing
export const SCROLL_HINT_TIMING = [
  0,
  TITLE_ENTRANCE_END * 0.4,
  TITLE_ENTRANCE_END,
  TITLE_EXIT_START * 0.5,
  TITLE_EXIT_START,
];
