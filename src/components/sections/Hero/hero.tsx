'use client';

import { motion, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { CrtScreen } from '@/components/ui/CrtScreen';
import { DecryptText } from '@/components/ui/DecryptText';
import { SweepText } from '@/components/ui/SweepText';
import { useScrollProgressAnimation } from '@/hooks/use-scroll-progress-animation';
import {
  HERO_NAME,
  HERO_TITLE,
  HERO_DESCRIPTION,
  ROLES,
} from './hero.constants';
import styles from './hero.module.css';
import { useTypewriter } from './use-typewriter';

// The Hero occupies 150vh — 1 vh for display, the rest for the zoom-through scroll
const HERO_SCROLL_PAGES = 1;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { text, currentRole } = useTypewriter({ roles: ROLES });

  const smoothProgress = useScrollProgressAnimation(
    sectionRef,
    HERO_SCROLL_PAGES,
  );

  // Zoom-through: content scales up and disappears as user scrolls
  const zoomScale = useTransform(smoothProgress, [0, 1], [1, 30]);
  const zoomOpacity = useTransform(smoothProgress, [0, 0.8, 1], [1, 1, 0]);

  // CRT effect fades out slightly before the full zoom
  const crtOpacity = useTransform(smoothProgress, [0, 0.7, 1], [1, 1, 0]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className={styles.heroSection}
      aria-label="Hero"
    >
      <div className={styles.stickyWrapper}>
        {/* Background gradients — decorative, no pointer events */}
        <div className={styles.backgroundGradients} />

        {/* Zoom container — driven by scroll progress */}
        <motion.div
          className={styles.zoomContainer}
          style={{ scale: zoomScale, opacity: zoomOpacity }}
        >
          <div className={styles.heroContent}>
            <p className={styles.heroName}>
              <DecryptText text={HERO_NAME} />
            </p>

            <h1 className={styles.heroRole}>
              <span className="sr-only" aria-live="polite">
                {HERO_TITLE} &amp; {currentRole}
              </span>
              <span aria-hidden="true">
                <SweepText className={styles.staticRole} text={HERO_TITLE} />
                <span className={styles.staticRole}>{'& '}</span>
                <span className={styles.rotatingRole}>{text}</span>
                <span className={styles.cursor} />
              </span>
            </h1>

            <p className={styles.heroDescription}>{HERO_DESCRIPTION}</p>

            <div className={styles.buttonsContainer}>
              <Button variant="primary" href="#work" aria-label="Explore Work">
                → Explore Work
              </Button>
              <Button
                variant="secondary"
                href={'/cv.pdf'}
                download={true}
                aria-label="View Resume"
              >
                ↓ View Resume
              </Button>
            </div>
          </div>
        </motion.div>

        {/* CRT screen overlay — rendered after content so it sits on top */}
        <CrtScreen opacity={crtOpacity} />

        {/* Scroll hint */}
        <div className={styles.scrollHint} aria-hidden="true">
          <div className={styles.arrow} />
          <span>Scroll</span>
        </div>
      </div>
    </section>
  );
}
