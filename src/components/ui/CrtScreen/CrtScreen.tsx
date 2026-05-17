'use client';

import type { MotionValue } from 'framer-motion';
import { motion } from 'framer-motion';
import styles from './CrtScreen.module.css';

interface CrtScreenProps {
  /** Motion value controlling overall CRT overlay opacity (0 = invisible, 1 = full effect) */
  opacity: MotionValue<number>;
}

/**
 * CrtScreen — retro CRT monitor overlay effect.
 *
 * Renders scanlines, electron beam sweep, glass glare, vignette, and film grain
 * on top of whatever is behind it. Controlled entirely by the `opacity` motion value
 * so the caller can drive fade-in/out via scroll or any other animation.
 *
 * All children are `pointer-events: none` — this overlay is purely decorative.
 */
export function CrtScreen({ opacity }: CrtScreenProps) {
  return (
    <motion.div className={styles.crtOverlay} style={{ opacity }}>
      <div className={styles.scanlines} />
      <div className={styles.beam} />
      <div className={styles.glare} />
      <div className={styles.vignette} />
      <div className={styles.screenNoise} />
    </motion.div>
  );
}
