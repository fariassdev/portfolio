'use client';

import type { MotionValue } from 'framer-motion';
import { motion } from 'framer-motion';
import styles from './CrtScreen.module.css';

interface CrtScreenProps {
  /** Motion value controlling overall CRT overlay opacity (0 = invisible, 1 = full effect) */
  opacity: MotionValue<number>;
  /** Optional motion value or number to drive the scale of the monitor frame during zoom-through */
  scale?: MotionValue<number> | number;
}

/**
 * CrtScreen — retro CRT monitor overlay effect.
 *
 * Renders scanlines, aperture grille, electron beam sweep, glass glare, vignette,
 * and film grain on top of whatever is behind it, surrounded by a realistic 3D bezel.
 * Driven by `opacity` and `scale` so the caller can create smooth zoom-through transitions.
 *
 * All children are `pointer-events: none` — this overlay is purely decorative.
 */
export function CrtScreen({ opacity, scale }: CrtScreenProps) {
  return (
    <motion.div className={styles.crtWrapper} style={{ opacity, scale }}>
      <div className={styles.crtOverlay}>
        <div className={styles.scanlines} />
        <div className={styles.apertureGrille} />
        <div className={styles.beam} />
        <div className={styles.glare} />
        <div className={styles.vignette} />
        <div className={styles.screenNoise} />
      </div>
    </motion.div>
  );
}
