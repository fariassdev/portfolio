import {
  type MotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { clamp } from '@/helpers/math.helpers';
import { getLaptopTransform } from '../Laptop/Laptop.helpers';
import { PROJECT_COUNT, PHASE_LENGTH } from '../ProjectsShowcase.constants';
import {
  SLIDE_CLIP_MAX_OFFSET,
  SWEEP_START_PERCENT,
  FADE_DURATION_PERCENT,
} from './ProjectSlide.constants';
import { getProjectSlideState, getSlideClipPath } from './ProjectSlide.helpers';
import type { SlideAnimationState } from './ProjectSlide.types';

/**
 * Custom hook that consolidates all animation logic for a project slide.
 * Optimized to minimize re-renders and improve code clarity.
 *
 * @param scrollProgress - Scroll progress motion value (0 to 1)
 * @param index - Index of the project in the list
 * @param side - Side of the laptop ('left' or 'right')
 * @returns Unified animation state object
 */
export function useSlideAnimation(
  scrollProgress: MotionValue<number>,
  index: number,
  side: 'left' | 'right',
): SlideAnimationState {
  const reduceMotion = useReducedMotion();

  // Create a synchronized timeline that maps raw projectsProgress to the laptop's horizontal transition timeline
  // This mirrors the laptopScrollProgress mapping defined in ViewportOverlay.tsx:
  // [PHASE_LENGTH, PHASE_LENGTH * 1.8, 1] -> [0, PHASE_LENGTH, 1]
  const synchronizedProgress = useTransform(scrollProgress, (progress) => {
    if (progress <= PHASE_LENGTH) return 0;
    if (progress <= PHASE_LENGTH * 1.8) {
      const t = (progress - PHASE_LENGTH) / (PHASE_LENGTH * 0.8);
      return clamp(t * PHASE_LENGTH, 0, PHASE_LENGTH);
    }
    const t = (progress - PHASE_LENGTH * 1.8) / (1 - PHASE_LENGTH * 1.8);
    return clamp(PHASE_LENGTH + t * (1 - PHASE_LENGTH), PHASE_LENGTH, 1);
  });

  // Primary animation state derived from synchronized scroll progress
  const slideState = useTransform(synchronizedProgress, (progress) =>
    getProjectSlideState(progress, index),
  );

  // Visibility control: slide is only visible during its reveal and blur phases
  const visibility = useTransform(slideState, (state) =>
    state.active ? 'visible' : 'hidden',
  );

  // Clip-path animation that creates the illusion of sliding in from the laptop
  const clipPath = useTransform(synchronizedProgress, (progress) => {
    if (reduceMotion) return 'none';
    const laptopTransform = getLaptopTransform(
      progress,
      PROJECT_COUNT,
      SLIDE_CLIP_MAX_OFFSET,
    );
    return getSlideClipPath(laptopTransform.xOffset, side);
  });

  // Mobile entrance animation (opacity): fades in/out over first 20% of reveal/blur
  const mobileEntranceOpacity = useTransform(slideState, (state) => {
    const fadeIn = clamp(state.reveal / FADE_DURATION_PERCENT, 0, 1);
    const fadeOut = clamp(1 - state.blur / FADE_DURATION_PERCENT, 0, 1);
    return Math.min(fadeIn, fadeOut);
  });

  // Master trigger for text animations: starts at SWEEP_START_PERCENT reveal
  // and resets when the slide is 50% blurred to allow re-triggering when scrolling back.
  const shouldAnimateText = useTransform(
    slideState,
    (state) => state.reveal >= SWEEP_START_PERCENT && state.blur <= 0.5,
  );

  // Content opacity with dual-phase fading (fade in + fade out)
  const contentOpacity = useTransform(slideState, (state) => {
    const fadeIn = clamp(state.reveal / FADE_DURATION_PERCENT, 0, 1);
    const fadeOut = clamp(1 - state.blur / FADE_DURATION_PERCENT, 0, 1);
    return Math.min(fadeIn, fadeOut);
  });

  return {
    clipPath,
    visibility,
    mobileEntranceOpacity,
    shouldAnimateText,
    contentOpacity,
  };
}
