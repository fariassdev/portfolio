'use client';

import {
  motion,
  useTransform,
  useMotionValue,
  animate,
  useMotionValueEvent,
  type MotionValue,
} from 'framer-motion';
import { memo } from 'react';
import styles from './sweep-text.module.css';

interface SweepTextProps {
  readonly text: string;
  readonly as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  readonly animate: MotionValue<boolean>;
  readonly className?: string;
}

/**
 * Reveals text from left to right with an animated scanline and glow effect.
 * Once the `animate` motion value becomes true, the animation plays to completion.
 */
export const SweepText = memo(function SweepText({
  text,
  as: Tag = 'span',
  animate: shouldAnimate,
  className,
}: SweepTextProps) {
  const progress = useMotionValue(0);

  // Use motion value events to trigger the animation without triggering React re-renders
  useMotionValueEvent(shouldAnimate, 'change', (latest) => {
    if (latest) {
      // Trigger automatic reveal animation
      animate(progress, 1, {
        duration: 0.8,
        ease: [0.33, 1, 0.68, 1], // quartOut for smooth deceleration
      });
    } else {
      // Reset progress when not active so it can re-trigger
      progress.set(0);
    }
  });

  // Clips the text, expanding the visible region from left (0%) to right (100%).
  const clipPath = useTransform(
    progress,
    (v) => `inset(0 ${(1 - v) * 100}% 0 0)`,
  );

  // Scanline fades in quickly at the start and out quickly at the end.
  const scanlineOpacity = useTransform(progress, (v) => {
    if (v <= 0 || v >= 1) return 0;
    const fadeIn = v / 0.1;
    const fadeOut = (1 - v) / 0.1;
    return Math.min(fadeIn, fadeOut, 1);
  });

  // Scanline and glow share the same horizontal position.
  const scanlineX = useTransform(progress, (v) => `${v * 100}%`);

  return (
    <Tag className={`${styles.container} ${className}`}>
      <motion.span className={styles.text} style={{ clipPath }}>
        {text}
      </motion.span>

      {/* Soft glow precedes the scanline */}
      <motion.span
        className={styles.glow}
        style={{ left: scanlineX, opacity: scanlineOpacity }}
      />

      {/* Hard scanline edge */}
      <motion.span
        className={styles.scanline}
        style={{ left: scanlineX, opacity: scanlineOpacity }}
      />
    </Tag>
  );
});

SweepText.displayName = 'SweepText';
