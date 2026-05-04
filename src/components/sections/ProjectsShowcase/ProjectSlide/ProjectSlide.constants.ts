// Clip Path Configuration
export const SLIDE_CLIP_MAX_OFFSET = 25;
export const CLIP_PATH_CENTER = 50;
export const CLIP_PATH_WIDTH = 24;
export const CLIP_PATH_TILT_FACTOR = 8;

// Animation Timing Constants (as percentages of reveal/blur phases)
export const SWEEP_START_PERCENT = 0.3; // Sweep text begins at 30% reveal
export const SWEEP_DURATION_PERCENT = 0.65; // Sweep completes at 95% (0.3 + 0.65)
export const LABEL_TRIGGER_PERCENT = 0.6; // Label decrypt starts at 60% sweep progress
export const FADE_DURATION_PERCENT = 0.2; // Fade in/out happens in first 20% of reveal/blur
export const MOBILE_ENTRANCE_DISTANCE_PX = 50; // Slides in from 50px below
