export const SCROLL_PAGES = 4.5; // Slightly increase scroll spacer for even smoother animations (450vh)

// Scroll progress thresholds mapped to each experience milestone
export const STAGES = {
  TITLE: { min: 0.0, max: 0.18 },
  BIO: { min: 0.18, max: 0.38 },
  Z1: { min: 0.38, max: 0.5, index: 0 },
  UOC: { min: 0.5, max: 0.62, index: 1 },
  HOMERIA: { min: 0.62, max: 0.74, index: 2 },
  AYTO: { min: 0.74, max: 0.86, index: 3 },
  ORIGINS: { min: 0.86, max: 0.98, index: 4 },
};

export const COMMIT_PHASES = [
  { min: 0.38, max: 0.5, hash: 'c4b8a192' },
  { min: 0.5, max: 0.62, hash: 'e2b4d9a1' },
  { min: 0.62, max: 0.74, hash: 'a8f9e038' },
  { min: 0.74, max: 0.86, hash: 'd3c4e12a' },
  { min: 0.86, max: 0.98, hash: '7b2a901e' },
];
