'use client';

import { motion, useTransform, useScroll, useSpring } from 'framer-motion';
import { useRef, type RefObject } from 'react';
import { Button } from '@/components/ui/Button';
import { DecryptText } from '@/components/ui/DecryptText';
import { SweepText } from '@/components/ui/SweepText';
import {
  HERO_NAME,
  HERO_TITLE,
  HERO_DESCRIPTION,
  ROLES,
} from './hero.constants';
import styles from './hero.module.css';
import { useTypewriter } from './use-typewriter';

interface HeroProps {
  sectionRef?: RefObject<HTMLElement | null>;
}

export function Hero({ sectionRef }: HeroProps) {
  const localRef = useRef<HTMLElement>(null);
  const activeRef = sectionRef || localRef;
  const { text, currentRole } = useTypewriter({ roles: ROLES });

  const { scrollYProgress } = useScroll({
    target: activeRef,
    offset: ['start start', 'end end'],
  });

  // Snappy but perfectly smoothed spring configuration to track scroll in real-time
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 250,
    damping: 35,
    mass: 0.5,
    restDelta: 0.0001,
  });

  // Zoom-through: content scales up and disappears as user scrolls
  const zoomScale = useTransform(smoothProgress, [0, 1], [1, 30]);
  const zoomOpacity = useTransform(smoothProgress, [0, 0.7, 1], [1, 1, 0]);

  // Fade out background radial glow as user scrolls down to projects
  const glowOpacity = useTransform(smoothProgress, [0, 0.8], [1, 0]);

  // Fade out scroll hint quickly as user scrolls down
  const scrollHintOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);

  // Disable pointer events once zoom-through completes so it doesn't block interactive elements behind it
  const pointerEvents = useTransform(smoothProgress, (p) =>
    p >= 0.9 ? 'none' : 'auto',
  );

  return (
    <section
      id="hero"
      ref={activeRef}
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
        <motion.div style={{ opacity: scrollHintOpacity, width: '100%' }}>
          <div className={styles.scrollHint} aria-hidden="true">
            <div className={styles.arrow} />
            <span>Scroll</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
