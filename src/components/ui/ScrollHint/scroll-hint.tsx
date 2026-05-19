'use client';

import { motion, type MotionValue } from 'framer-motion';
import styles from './scroll-hint.module.css';

interface ScrollHintProps {
  opacity?: MotionValue<number> | number;
  className?: string;
}

export function ScrollHint({ opacity, className }: ScrollHintProps) {
  return (
    <motion.div
      className={`${styles.scrollHintContainer} ${className || ''}`.trim()}
      style={{ opacity }}
    >
      <div className={styles.scrollHint} aria-hidden="true">
        <span className={styles.prompt}>$</span>
        <span className={styles.command}>scroll</span>
        <span className={styles.flag}>--down</span>
        <span className={styles.promptCursor} />
        <span className={styles.arrowContainer}>
          <span className={styles.bracket}>[</span>
          <span className={styles.arrow}>↓</span>
          <span className={styles.bracket}>]</span>
        </span>
      </div>
    </motion.div>
  );
}
