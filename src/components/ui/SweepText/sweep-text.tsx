'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
import { memo } from 'react';
import styles from './sweep-text.module.css';

interface SweepTextProps {
  readonly text: string;
  readonly as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  readonly revealProgress: MotionValue<number>;
  readonly className?: string;
}

/**
 * Reveals text from left to right with an animated scanline and glow effect.
 * Driven by an external `MotionValue<number>` in [0, 1].
 */
export const SweepText = memo(function SweepText({
  text,
  as: Tag = 'span',
  revealProgress,
  className,
}: SweepTextProps) {
  // Clips the text, expanding the visible region from left (0%) to right (100%).
  const clipPath = useTransform(
    revealProgress,
    (progress) => `inset(0 ${(1 - progress) * 100}% 0 0)`,
  );

  // Scanline fades in quickly at the start and out quickly at the end.
  const scanlineOpacity = useTransform(revealProgress, (progress) => {
    if (progress <= 0 || progress >= 1) return 0;
    const fadeIn = progress / 0.1;
    const fadeOut = (1 - progress) / 0.1;
    return Math.min(fadeIn, fadeOut, 1);
  });

  // Scanline and glow share the same horizontal position.
  const scanlineX = useTransform(
    revealProgress,
    (progress) => `${progress * 100}%`,
  );

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
