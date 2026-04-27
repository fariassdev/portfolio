export interface Project {
  id: string;
  title: string;
  description: string;
  previewSrc: string;
  side: 'left' | 'right';
}

export interface ProjectSlideState {
  reveal: number;
  blur: number;
  active: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export const PROJECTS: Project[] = [
  {
    id: 'senda',
    title: 'Senda',
    description:
      'Real-time AI content generation platform. Built from 0→1 as sole backend engineer. Designed the entire distributed architecture: API gateway, async job queues, WebSocket streaming, multi-tenant data isolation.',
    previewSrc: '/images/senda/senda.webm',
    side: 'right',
  },
  {
    id: 'senda-2',
    title: 'Senda',
    description:
      'Real-time AI content generation platform. Built from 0→1 as sole backend engineer. Designed the entire distributed architecture: API gateway, async job queues, WebSocket streaming, multi-tenant data isolation.',
    previewSrc: '/images/senda/Senda_demo_overview.mp4',
    side: 'left',
  },
];

export function getProjectSlideState(
  progress: number,
  index: number,
): ProjectSlideState {
  const n = PROJECTS.length;
  if (n === 0) return { reveal: 0, blur: 0, active: false };

  const totalPages = n * 2 + 1;
  const phaseLength = 1 / totalPages;

  const revealStart = (2 * index + 1) * phaseLength;
  const blurStart = revealStart + phaseLength;

  const activeStart = revealStart - phaseLength / 4;
  const activeEnd = index === n - 1 ? 1 : blurStart + phaseLength;

  return {
    reveal: clamp((progress - revealStart) / phaseLength, 0, 1),
    blur:
      index === n - 1 ? 0 : clamp((progress - blurStart) / phaseLength, 0, 1),
    active: progress >= activeStart && progress <= activeEnd,
  };
}

/**
 * Total scroll spacer height in viewport units.
 * Dynamically calculated based on number of projects.
 * Total phases = N * 2 + 1.
 */
export const SCROLL_PAGES = PROJECTS.length > 0 ? PROJECTS.length * 2 + 1 : 1;
