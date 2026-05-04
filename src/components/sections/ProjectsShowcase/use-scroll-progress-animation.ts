import { useSpring, useTransform } from 'framer-motion';
import { useScroll } from 'framer-motion';
import type { RefObject } from 'react';

/**
 * Animation configuration for scroll progress snapping.
 * Controls how smoothly the animation snaps between phases.
 */
const SCROLL_SNAP_CONFIG = {
  stiffness: 100,
  damping: 30,
  mass: 0.5,
  restDelta: 0.0001,
} as const;

/**
 * Custom hook that manages smooth scroll-based animation with phase snapping.
 * Consolidates scroll tracking and spring animation logic.
 *
 * @param scrollRef - Ref to the scroll container element
 * @param scrollPages - Number of animation phases (derived from project count)
 * @returns Smooth progress motion value (0 to 1) that snaps to phases
 */
export function useScrollProgressAnimation(
  scrollRef: RefObject<HTMLElement | null>,
  scrollPages: number,
) {
  // Raw scroll progress (0 to 1)
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'],
  });

  /**
   * Snap progress to the nearest animation phase.
   * This creates discrete animation states: snaps to 0/1/2/3/etc instead of
   * allowing intermediate positions, which satisfies the visual "no intermediate
   * position" requirement while maintaining smooth spring animation.
   */
  const snappedProgress = useTransform(scrollYProgress, (rawProgress) => {
    if (rawProgress <= 0) return 0;
    if (rawProgress >= 1) return 1;

    // Round to nearest phase
    const phase = Math.round(rawProgress * scrollPages);
    return phase / scrollPages;
  });

  /**
   * Apply spring smoothing to create natural deceleration and arrival.
   * The spring configuration is tuned to provide snappy but not bouncy feedback.
   */
  const smoothProgress = useSpring(snappedProgress, SCROLL_SNAP_CONFIG);

  return smoothProgress;
}
