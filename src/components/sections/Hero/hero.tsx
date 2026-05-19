'use client';

import { motion, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { DecryptText } from '@/components/ui/DecryptText';
import { ScrollHint } from '@/components/ui/ScrollHint';
import { SweepText } from '@/components/ui/SweepText';
import { useScrollTimeline } from '@/context/ScrollTimelineContext';
import {
  HERO_NAME,
  HERO_TITLE,
  HERO_DESCRIPTION,
  ROLES,
  HERO_FADE_START,
  HERO_FADE_END,
} from './hero.constants';
import styles from './hero.module.css';
import { useTypewriter } from './use-typewriter';

export function Hero() {
  const { heroRef, heroProgress } = useScrollTimeline();
  const { text, currentRole } = useTypewriter({ roles: ROLES });
  const MAX_ZOOM_SCALE = 18;

  // Zoom-through: content scales up and disappears as user scrolls, synchronized to finish at HERO_FADE_END progress
  const zoomScale = useTransform(
    heroProgress,
    [0, HERO_FADE_END],
    [1, MAX_ZOOM_SCALE],
  );
  const zoomOpacity = useTransform(
    heroProgress,
    [0, HERO_FADE_START, HERO_FADE_END],
    [1, 1, 0],
  );

  // Fade out background radial glow as user scrolls down, synchronized with content zoom
  const glowOpacity = useTransform(
    heroProgress,
    [0, HERO_FADE_START, HERO_FADE_END],
    [1, 1, 0],
  );

  // Fade out scroll hint quickly as user scrolls down
  const scrollHintOpacity = useTransform(heroProgress, [0, 0.15], [1, 0]);

  // Disable pointer events once zoom-through completes so it doesn't block interactive elements behind it
  const pointerEvents = useTransform(heroProgress, (p) =>
    p >= HERO_FADE_END ? 'none' : 'auto',
  );

  return (
    <section
      id="home"
      ref={heroRef}
      className={styles.heroSection}
      aria-label="Hero"
    >
      <motion.div className={styles.stickyWrapper} style={{ pointerEvents }}>
        {/* Background gradients — decorative, no pointer events */}
        <motion.div
          className={styles.backgroundGradients}
          style={{ opacity: glowOpacity }}
        />

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
              <Button
                variant="primary"
                href="#projects"
                aria-label="Explore Projects"
              >
                → Explore Projects
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

        {/* Scroll hint — fades out as user scrolls */}
        <ScrollHint opacity={scrollHintOpacity} />
      </motion.div>
    </section>
  );
}
