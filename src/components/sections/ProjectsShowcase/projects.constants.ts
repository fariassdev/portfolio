export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
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

export function getProjectSlideState(
  progress: number,
  index: number,
): ProjectSlideState {
  if (index === 0) {
    return {
      reveal: clamp((progress - 0.2) / 0.2, 0, 1),
      blur: clamp((progress - 0.4) / 0.2, 0, 1),
      active: progress >= 0.15 && progress < 0.6,
    };
  }

  if (index === 1) {
    return {
      reveal: clamp((progress - 0.6) / 0.2, 0, 1),
      blur: 0,
      active: progress >= 0.55 && progress <= 1,
    };
  }

  return {
    reveal: 0,
    blur: 0,
    active: false,
  };
}

export const PROJECTS: Project[] = [
  {
    id: 'senda',
    title: 'Senda',
    description:
      'Real-time AI content generation platform. Built from 0→1 as sole backend engineer. Designed the entire distributed architecture: API gateway, async job queues, WebSocket streaming, multi-tenant data isolation.',
    image: '/images/senda/senda.webm',
    side: 'right',
  },
  {
    id: 'senda-2',
    title: 'Senda',
    description:
      'Real-time AI content generation platform. Built from 0→1 as sole backend engineer. Designed the entire distributed architecture: API gateway, async job queues, WebSocket streaming, multi-tenant data isolation.',
    image: '/images/senda/Senda_demo_overview.mp4',
    side: 'left',
  },
];

/**
 * Total scroll spacer height in viewport units.
 * Phase 0 (1vh): Lid opens
 * Phase 1 (1vh): Laptop slides, Project 1 reveals
 * Phase 2 (1vh): Blur transition
 * Phase 3 (1vh): Laptop slides opposite, Project 2 reveals
 * Phase 4 (1vh): Hold / exit
 */
export const SCROLL_PAGES = 5;
