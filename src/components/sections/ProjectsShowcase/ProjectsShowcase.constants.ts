import { PROJECTS } from './ProjectsShowcase.data';

// Scene Configuration
export const LID_CLOSED = Math.PI / 2;
export const LID_OPEN = 0;
export const LAPTOP_SCALE = 45;
export const CAMERA_Z = 900;
export const MOBILE_BREAKPOINT = 696;

// Animation Configuration
export const BASE_LAPTOP_ROTATION_X = Math.PI / 16;
export const MAX_LAPTOP_ROTATION_Y = Math.PI / 6;
export const PARALLAX_X_FACTOR = 0.05;
export const PARALLAX_Y_FACTOR = 0.1;
export const DESKTOP_SLIDE_FACTOR = 0.26;

// Clip Path Configuration
export const SLIDE_CLIP_MAX_OFFSET = 25;
export const CLIP_PATH_CENTER = 50;
export const CLIP_PATH_WIDTH = 24;
export const CLIP_PATH_TILT_FACTOR = 8;

// Derived Animation Values
export const PROJECT_COUNT = PROJECTS.length;
export const SCROLL_PAGES = PROJECT_COUNT * 2 + 1;
export const PHASE_LENGTH = 1 / SCROLL_PAGES;
