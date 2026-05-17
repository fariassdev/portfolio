import { useSpring, useTransform } from 'framer-motion';
import { useScroll } from 'framer-motion';
import type { RefObject } from 'react';

/**
 * Animation configuration for scroll progress snapping.
 * Controls how smoothly the animation snaps between phases.
 */
const SCROLL_SNAP_CONFIG = {
  stiffness: 120,
  damping: 30,
  mass: 0.8,
  restDelta: 0.0001,
} as const;

/**
 * Custom hook that manages smooth scroll-based animation with phase snapping.
 * Consolidates scroll tracking and spring animation logic.
 *
 * @param scrollRef - Ref to the scroll container element
 * @param scrollPages - Number of animation phases (derived from project count)
 * @param openingRatio - Optional ratio of total scroll dedicated to the opening phase
 * @returns Smooth progress motion value (0 to 1) that snaps to phases
 */
export function useScrollProgressAnimation(
  scrollRef: RefObject<HTMLElement | null>,
  scrollPages: number,
  openingRatio?: number,
) {
  // Raw scroll progress (0 to 1)
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'],
  });

  const phaseLength = 1 / scrollPages;

  /**
   * Warp the progress if an openingRatio is provided.
   * This maps the physical scroll (rawProgress) to logical animation phases (warpedProgress).
   */
  const warpedProgress = useTransform(scrollYProgress, (raw) => {
    if (!openingRatio || raw <= 0 || raw >= 1) return raw;

    if (raw < openingRatio) {
      // Warp the first phase (Opening)
      return (raw / openingRatio) * phaseLength;
    }

    // Map the remaining phases linearly
    return (
      phaseLength +
      ((raw - openingRatio) / (1 - openingRatio)) * (1 - phaseLength)
    );
  });

  /**
   * Snap progress to the nearest animation phase.
   * This creates discrete animation states: snaps to 0/1/2/3/etc instead of
   * allowing intermediate positions, which satisfies the visual "no intermediate
   * position" requirement while maintaining smooth spring animation.
   */
  const snappedProgress = useTransform(warpedProgress, (progress) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;

    // Opening phase: Fluid movement
    if (progress < phaseLength) {
      return progress;
    }

    // Closing phase: Fluid movement
    if (progress > 1 - phaseLength) {
      return progress;
    }

    // Intermediate project phases: Snapped movement
    const phase = Math.round(progress * scrollPages);
    return phase / scrollPages;
  });

  /**
   * Apply spring smoothing to create natural deceleration and arrival.
   * The spring configuration is tuned to provide snappy but not bouncy feedback.
   */
  const smoothProgress = useSpring(snappedProgress, SCROLL_SNAP_CONFIG);

  return smoothProgress;
}
