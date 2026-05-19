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
        <div className={styles.arrow} />
        <span>Scroll</span>
      </div>
    </motion.div>
  );
}
