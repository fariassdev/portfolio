import { PROJECTS } from './ProjectsShowcase.data';

// Scene Configuration
export const MOBILE_BREAKPOINT = 696;

// Derived Animation Values
export const PROJECT_COUNT = PROJECTS.length;
export const SCROLL_PAGES = Math.max(PROJECT_COUNT * 2 + 5, 1);
export const PHASE_LENGTH = 1 / SCROLL_PAGES;
