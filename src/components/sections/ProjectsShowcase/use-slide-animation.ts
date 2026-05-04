import {
  type MotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { clamp } from '@/helpers/math.helpers';
import {
  PROJECT_COUNT,
  SLIDE_CLIP_MAX_OFFSET,
  SWEEP_START_PERCENT,
  SWEEP_DURATION_PERCENT,
  LABEL_TRIGGER_PERCENT,
  FADE_DURATION_PERCENT,
  MOBILE_ENTRANCE_DISTANCE_PX,
} from './ProjectsShowcase.constants';
import {
  getLaptopTransform,
  getProjectSlideState,
  getSlideClipPath,
} from './ProjectsShowcase.helpers';

/**
 * Animation state for a single project slide.
 * Consolidates all slide-related motion values into a single object.
 */
interface SlideAnimationState {
  /** CSS clip-path for masking the slide content */
  clipPath: MotionValue<string>;
  /** Visibility state (visible/hidden) */
  visibility: MotionValue<'visible' | 'hidden'>;
  /** Mobile entrance Y offset in pixels */
  mobileEntranceY: MotionValue<number>;
  /** Mobile entrance opacity (0 to 1) */
  mobileEntranceOpacity: MotionValue<number>;
  /** Text sweep reveal progress (0 to 1) */
  sweepReveal: MotionValue<number>;
  /** Whether the decrypt label animation should be active */
  isLabelActive: MotionValue<boolean>;
  /** Content fade in/out opacity */
  contentOpacity: MotionValue<number>;
  /** Content Y position with reveal and blur transforms */
  contentY: MotionValue<number>;
}

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

  // Primary animation state derived from scroll progress
  const slideState = useTransform(scrollProgress, (progress) =>
    getProjectSlideState(progress, index),
  );

  // Visibility control: slide is only visible during its reveal and blur phases
  const visibility = useTransform(slideState, (state) =>
    state.active ? 'visible' : 'hidden',
  );

  // Clip-path animation that creates the illusion of sliding in from the laptop
  const clipPath = useTransform(scrollProgress, (progress) => {
    if (reduceMotion) return 'none';
    const laptopTransform = getLaptopTransform(
      progress,
      PROJECT_COUNT,
      SLIDE_CLIP_MAX_OFFSET,
    );
    return getSlideClipPath(laptopTransform.xOffset, side);
  });

  // Mobile entrance animation (Y offset): starts at MOBILE_ENTRANCE_DISTANCE_PX below
  const mobileEntranceY = useTransform(
    slideState,
    (state) => (1 - state.reveal) * MOBILE_ENTRANCE_DISTANCE_PX,
  );

  // Mobile entrance animation (opacity): fades in over first 50% of reveal
  const mobileEntranceOpacity = useTransform(slideState, (state) =>
    clamp(state.reveal * 2, 0, 1),
  );

  // Sweep text animation: starts at SWEEP_START_PERCENT, completes at 95%
  const sweepReveal = useTransform(slideState, (state) =>
    clamp((state.reveal - SWEEP_START_PERCENT) / SWEEP_DURATION_PERCENT, 0, 1),
  );

  // Label decrypt trigger: waits until sweep reveal reaches LABEL_TRIGGER_PERCENT
  const isLabelActive = useTransform(
    sweepReveal,
    (sweepProgress) => sweepProgress > LABEL_TRIGGER_PERCENT,
  );

  // Content opacity with dual-phase fading (fade in + fade out)
  const contentOpacity = useTransform(slideState, (state) => {
    const fadeInProgress = clamp(state.reveal / FADE_DURATION_PERCENT, 0, 1);
    const fadeOutProgress = clamp(
      (1 - state.blur) / FADE_DURATION_PERCENT,
      0,
      1,
    );
    return Math.min(fadeInProgress, fadeOutProgress);
  });

  // Content Y position: moves up during reveal, down during blur
  const contentY = useTransform(slideState, (state) => {
    const revealEased = clamp(state.reveal / FADE_DURATION_PERCENT, 0, 1);
    return state.blur * -20 + (1 - revealEased) * 20;
  });

  return {
    clipPath,
    visibility,
    mobileEntranceY,
    mobileEntranceOpacity,
    sweepReveal,
    isLabelActive,
    contentOpacity,
    contentY,
  };
}
