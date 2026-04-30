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
 * SweepText component that reveals text from left to right with a scanline.
 */
export const SweepText = memo(function SweepText({
  text,
  as: Tag = 'span',
  revealProgress,
  className,
}: SweepTextProps) {
  const clipPath = useTransform(
    revealProgress,
    (progress) => `inset(0 ${100 - progress * 100}% 0 0%)`,
  );

  const scanlineOpacity = useTransform(revealProgress, (progress) => {
    if (progress <= 0 || progress >= 1) return 0;
    return Math.min(progress / 0.1, (1 - progress) / 0.1, 1);
  });

  const scanlineX = useTransform(
    revealProgress,
    (progress) => `${progress * 100}%`,
  );

  return (
    <Tag className={`${styles.container} ${className}`}>
      <motion.span className={styles.text} style={{ clipPath }}>
        {text}
      </motion.span>

      <motion.span
        className={styles.glow}
        style={{
          left: scanlineX,
          opacity: scanlineOpacity,
        }}
      />

      <motion.span
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
