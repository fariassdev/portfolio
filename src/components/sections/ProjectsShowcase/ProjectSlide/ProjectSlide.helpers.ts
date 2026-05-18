import { clamp } from '@/helpers/math.helpers';
import { PHASE_LENGTH, PROJECT_COUNT } from '../ProjectsShowcase.constants';
import {
  CLIP_PATH_CENTER,
  CLIP_PATH_TILT_FACTOR,
  CLIP_PATH_WIDTH,
  SLIDE_CLIP_MAX_OFFSET,
} from './ProjectSlide.constants';
import type { ProjectSlideState } from './ProjectSlide.types';

/**
 * Generates the CSS clip-path for the project slides.
 */
export function getSlideClipPath(laptopX: number, side: 'left' | 'right') {
  const xPercent = CLIP_PATH_CENTER + laptopX;
  const tilt = (laptopX / SLIDE_CLIP_MAX_OFFSET) * CLIP_PATH_TILT_FACTOR;

  if (side === 'right') {
    const edge = xPercent + CLIP_PATH_WIDTH / 2;
    const base = ((edge - 55) / 45) * 100;
    const x1 = base + tilt;
    const x2 = base - tilt;
    return `polygon(${x1}% -20%, 120% -20%, 120% 120%, ${x2}% 120%)`;
  }

  const edge = xPercent - CLIP_PATH_WIDTH / 2;
  const base = ((45 - edge) / 45) * 100;
  const x1 = 100 - base - tilt;
  const x2 = 100 - base + tilt;
  return `polygon(-20% -20%, ${x1}% -20%, ${x2}% 120%, -20% 120%)`;
}

/**
 * Calculates the state of an individual project slide (reveal, blur, active).
 */
export function getProjectSlideState(
  progress: number,
  index: number,
): ProjectSlideState {
  if (PROJECT_COUNT === 0) return { reveal: 0, blur: 0, active: false };

  // Project i: Reveal starts at phase 2*index + 1 (when laptop starts to slide in/transition)
  // Blur starts at phase 2*index + 3 (when laptop starts to transition out)
  const revealStart = (2 * index + 1) * PHASE_LENGTH;
  const blurStart = (2 * index + 3) * PHASE_LENGTH;

  const activeStart = revealStart;
  const activeEnd = blurStart + PHASE_LENGTH;

  return {
    reveal: clamp((progress - revealStart) / PHASE_LENGTH, 0, 1),
    blur: clamp((progress - blurStart) / PHASE_LENGTH, 0, 1),
    active: progress >= activeStart && progress <= activeEnd,
  };
}
