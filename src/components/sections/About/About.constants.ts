/**
 * Scroll journey and timing configuration for the About section.
 */

// Scroll spacer height representing 4.0 pages (400vh) of scroll journey
export const SCROLL_PAGES = 4.0;
export const TOTAL_SPACER_HEIGHT = SCROLL_PAGES * 100;

// Title transition thresholds (Stage 1)
export const TITLE_ENTRANCE_END = 0.1333;
export const TITLE_EXIT_START = 0.4333;
export const TITLE_EXIT_END = 0.5833;

// Terminal section transitions
export const LAYOUT_TIMING_OPACITY = [0.5833, 0.7333];
export const LAYOUT_TIMING_Y = [0.5833, 0.7333];

// Scroll hint transition timing
export const SCROLL_HINT_TIMING = [
  0,
  TITLE_ENTRANCE_END * 0.4,
  TITLE_ENTRANCE_END,
  TITLE_EXIT_START * 0.5,
  TITLE_EXIT_START,
];
