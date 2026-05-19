export const SCROLL_PAGES = 4; // Height multiplier for the scroll spacer (400vh)

// Scroll progress thresholds mapped to each experience milestone
export const STAGES = {
  TITLE: { min: 0.0, max: 0.2 },
  Z1: { min: 0.2, max: 0.36, index: 0 },
  UOC: { min: 0.36, max: 0.52, index: 1 },
  HOMERIA: { min: 0.52, max: 0.68, index: 2 },
  AYTO: { min: 0.68, max: 0.84, index: 3 },
  ORIGINS: { min: 0.84, max: 1.0, index: 4 },
};

export const COMMIT_PHASES = [
  { min: 0.2, max: 0.36, hash: 'c4b8a192' },
  { min: 0.36, max: 0.52, hash: 'e2b4d9a1' },
  { min: 0.52, max: 0.68, hash: 'a8f9e038' },
  { min: 0.68, max: 0.84, hash: 'd3c4e12a' },
  { min: 0.84, max: 1.0, hash: '7b2a901e' },
];
