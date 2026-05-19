/**
 * Scroll journey and timing configuration for the About section.
 */

// Scroll spacer height representing 2.5 pages (250vh) of scroll journey
export const SCROLL_PAGES = 2.5;
export const TOTAL_SPACER_HEIGHT = SCROLL_PAGES * 100;

// Title transition thresholds (Stage 1)
export const TITLE_ENTRANCE_END = 0.15;
export const TITLE_EXIT_START = 0.35;
export const TITLE_EXIT_END = 0.48;

// Content section transitions (Stage 2)
export const LAYOUT_TIMING_OPACITY = [0.48, 0.6];
export const LAYOUT_TIMING_Y = [0.48, 0.6];

// Scroll hint transition timing
export const SCROLL_HINT_TIMING = [
  0,
  TITLE_ENTRANCE_END * 0.4,
  TITLE_ENTRANCE_END,
  TITLE_EXIT_START * 0.6,
  TITLE_EXIT_START,
];
