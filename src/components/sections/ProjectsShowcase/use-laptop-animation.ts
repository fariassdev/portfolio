import {
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { useRef } from 'react';
import { getScreenTransition } from './ProjectsShowcase.helpers';

/**
 * Unified laptop animation state for frame updates.
 * Consolidates all laptop-related animation values and state management.
 */
interface LaptopAnimationState {
  /** Lid hinge rotation motion value (0 = open, π/2 = closed) */
  lidRotation: MotionValue<number>;
  /** Screen content opacity based on lid position */
  screenOpacity: MotionValue<number>;
  /** Internal blend state for texture transitions */
  blendMotion: MotionValue<number>;
}

/**
 * Transition trigger callback when project changes.
 */
type TransitionCallback = (fromIndex: number, toIndex: number) => void;

/**
 * Custom hook that manages laptop animation state and transitions.
 * Consolidates lid animation, opacity, and screen transitions.
 *
 * @param scrollProgress - Scroll progress motion value (0 to 1)
 * @param projectCount - Number of projects
 * @param mediaCount - Number of media textures
 * @param onTransition - Callback when project index changes
 * @returns Unified laptop animation state
 */
export function useLaptopAnimation(
  scrollProgress: MotionValue<number>,
  projectCount: number,
  mediaCount: number,
  onTransition: TransitionCallback,
): LaptopAnimationState {
  const reduceMotion = useReducedMotion();

  // Calculate phase length for animation timing
  const phaseLength = 1 / Math.max(projectCount * 2 + 1, 1);

  /**
   * Lid rotation animation:
   * - Closes at start (phase 0): from closed to open
   * - Opens during phases 1 to N: stays open
   * - Closes at end (phase 2N): back to closed
   */
  const lidRotation = useTransform(
    scrollProgress,
    [0, phaseLength, 1 - phaseLength, 1],
    [Math.PI / 2, 0, 0, Math.PI / 2],
  );

  /**
   * Screen opacity driven by lid position.
   * Creates a parallax effect where the screen becomes visible as lid opens.
   * Maps: closed → invisible, half-open → transitioning, open → fully visible
   */
  const screenOpacity = useTransform(
    lidRotation,
    [Math.PI / 2, (Math.PI / 2) * 0.7, 0],
    [0, 0, 1],
  );

  // Internal motion value for texture blend tracking
  const blendMotion = useMotionValue(0);

  // Track last settled project to trigger transitions only on change
  const lastProjectRef = useRef(0);

  /**
   * Detect project index changes and trigger screen transitions.
   * This runs on scroll events to identify when the user has settled
   * on a new project and needs the texture to transition.
   */
  useMotionValueEvent(scrollProgress, 'change', (progress) => {
    if (reduceMotion) return;

    const transition = getScreenTransition(progress, projectCount, mediaCount);

    // Determine which project the user is "looking at"
    // (blend > 0.5 means we're closer to the destination)
    const targetProjectIndex =
      transition.blend > 0.5 ? transition.toIndex : transition.fromIndex;

    // Only trigger transition when project changes
    if (targetProjectIndex !== lastProjectRef.current) {
      const previousProject = lastProjectRef.current;
      lastProjectRef.current = targetProjectIndex;
      onTransition(previousProject, targetProjectIndex);
    }
  });

  return {
    lidRotation,
    screenOpacity,
    blendMotion,
  };
}

/**
 * Helper hook that returns laptop transform state for a single frame update.
 * Useful for imperative frame-by-frame animations.
 *
 * @param scrollProgress - Scroll progress motion value
 * @param projectCount - Number of projects
 * @param mediaCount - Number of media textures
 * @returns Object with current animation values that can be read synchronously
 */
export function useLaptopFrameAnimation(
  scrollProgress: MotionValue<number>,
  projectCount: number,
  mediaCount: number,
) {
  const progressRef = useRef(0);

  useMotionValueEvent(scrollProgress, 'change', (progress) => {
    progressRef.current = progress;
  });

  return {
    getCurrentProgress: () => progressRef.current,
    getTransition: () =>
      getScreenTransition(progressRef.current, projectCount, mediaCount),
  };
}
