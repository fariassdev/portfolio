'use client';

import { motion, type Transition } from 'framer-motion';
import { memo } from 'react';
import styles from './sweep-text.module.css';

interface SweepTextProps {
  readonly text: string;
  readonly as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  readonly shouldAnimate?: boolean;
  readonly className?: string;
}

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
  // Shared transition configuration for synchronized movement
  const transition: Transition = {
    duration: 0.8,
    ease: [0.33, 1, 0.68, 1],
  };

  // Variants ensure reliable string interpolation for complex CSS properties like clip-path
  const variants = {
    hidden: {
      clipPath: 'inset(0% 100% 0% 0%)',
    },
    visible: {
      clipPath: 'inset(0% 0% 0% 0%)',
    },
  };

  return (
    <Tag className={`${styles.container} ${className}`}>
      {/* Animated text layer with expanding clip-path */}
      <motion.span
        className={styles.text}
        variants={variants}
        initial="hidden"
        animate={shouldAnimate ? 'visible' : 'hidden'}
        transition={transition}
      >
        {text}
      </motion.span>

      {/* Soft glow precedes the scanline */}
      <motion.span
        className={styles.glow}
        initial={{ left: '0%', opacity: 0 }}
        animate={{
          left: shouldAnimate ? '100%' : '0%',
          opacity: shouldAnimate ? [0, 1, 1, 0] : 0,
        }}
        transition={{
          ...transition,
          opacity: { ...transition, times: [0, 0.1, 0.9, 1] },
        }}
      />

      {/* Hard scanline edge */}
      <motion.span
        className={styles.scanline}
        initial={{ left: '0%', opacity: 0 }}
        animate={{
          left: shouldAnimate ? '100%' : '0%',
          opacity: shouldAnimate ? [0, 1, 1, 0] : 0,
        }}
        transition={{
          ...transition,
          opacity: { ...transition, times: [0, 0.1, 0.9, 1] },
        }}
      />
    </Tag>
  );
});

SweepText.displayName = 'SweepText';
