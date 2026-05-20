'use client';

import {
  animate,
  motion,
  type Transition,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { memo, useEffect } from 'react';
import styles from './sweep-text.module.css';

interface SweepTextProps {
  readonly text: string;
  readonly as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  readonly shouldAnimate?: boolean;
  readonly className?: string;
}

const SWEEP_TRANSITION: Transition = {
  duration: 0.8,
  ease: [0.33, 1, 0.68, 1],
};

/**
 * Reveals text from left to right with an animated scanline and glow effect.
 * Once the `shouldAnimate` prop becomes true, the animation plays to completion.
 */
export const SweepText = memo(function SweepText({
  text,
  as: Tag = 'span',
  shouldAnimate = true,
  className,
}: SweepTextProps) {
  const shouldReduceMotion = useReducedMotion();
  const sweepProgress = useMotionValue(0);
  const clipPath = useTransform(
    sweepProgress,
    (value) => `inset(0% ${100 - value * 100}% 0% 0%)`,
  );
  const sweepLeft = useTransform(sweepProgress, (value) => `${value * 100}%`);
  const sweepOpacity = useTransform(
    sweepProgress,
    [0, 0.1, 0.9, 1],
    [0, 1, 1, 0],
  );

  useEffect(() => {
    if (shouldReduceMotion) {
      sweepProgress.set(shouldAnimate ? 1 : 0);
      return;
    }

    const controls = animate(
      sweepProgress,
      shouldAnimate ? 1 : 0,
      SWEEP_TRANSITION,
    );

    return () => controls.stop();
  }, [shouldAnimate, shouldReduceMotion, sweepProgress]);

  return (
    <Tag className={`${styles.container}${className ? ` ${className}` : ''}`}>
      {/* Animated text layer with expanding clip-path */}
      <motion.span className={styles.text} style={{ clipPath }}>
        {text}
      </motion.span>

      {/* Soft glow precedes the scanline */}
      <motion.span
        className={styles.glow}
        style={{ left: sweepLeft, opacity: sweepOpacity }}
      />

      {/* Hard scanline edge */}
      <motion.span
        className={styles.scanline}
        style={{ left: sweepLeft, opacity: sweepOpacity }}
      />
    </Tag>
  );
});

SweepText.displayName = 'SweepText';
