'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
import { memo } from 'react';
import styles from './sweep-text.module.css';

interface SweepTextProps {
  readonly text: string;
  readonly as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span';
  readonly revealProgress: MotionValue<number>;
  readonly hideProgress: MotionValue<number>;
  readonly className?: string;
}

/**
 * SweepText component that reveals text from left to right with a scanline
 * and hides it from right to left (inverse scanline).
 */
export const SweepText = memo(function SweepText({
  text,
  as: Tag = 'span',
  revealProgress,
  hideProgress,
  className,
}: SweepTextProps) {
  // Reveal: 0 (hidden) to 1 (full)
  // clip-path inset(0 100% 0 0) -> inset(0 0% 0 0)
  const revealClip = useTransform(revealProgress, [0, 1], [100, 0]);

  // Hide: 0 (visible) to 1 (hidden)
  // clip-path inset(0 0% 0 0) -> inset(0 100% 0 0)
  const hideClip = useTransform(hideProgress, [0, 1], [0, 100]);

  // Combined clip path: inset(0 right% 0 0%)
  // We use the maximum value of both to ensure the text is clipped correctly during both phases
  const combinedClipPath = useTransform(
    [revealClip, hideClip],
    ([r, h]) => `inset(0 ${Math.max(r as number, h as number)}% 0 0%)`,
  );

  const scanlineOpacity = useTransform(
    [revealProgress, hideProgress],
    ([r, h]) => {
      const rv = r as number;
      const hv = h as number;
      // Tighten thresholds to ensure scanline is only visible during active movement
      const isRevealing = rv > 0.02 && rv < 0.98;
      const isHiding = hv > 0.02 && hv < 0.98;
      return isRevealing || isHiding ? 1 : 0;
    },
  );

  const scanlineX = useTransform([revealProgress, hideProgress], ([r, h]) => {
    if ((h as number) > 0) return `${100 - (h as number) * 100}%`;
    return `${(r as number) * 100}%`;
  });

  return (
    <Tag className={`${styles.container} ${className}`}>
      <motion.span
        className={styles.text}
        style={{ clipPath: combinedClipPath }}
      >
        {text}
      </motion.span>
      <motion.div
        className={styles.scanline}
        style={{
          left: scanlineX,
          opacity: scanlineOpacity,
        }}
      />
    </Tag>
  );
});

SweepText.displayName = 'SweepText';
