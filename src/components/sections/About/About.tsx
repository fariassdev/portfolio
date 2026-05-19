'use client';

import { motion, useTransform, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { DecryptText } from '@/components/ui/DecryptText/decrypt-text';
import { ScrollHint } from '@/components/ui/ScrollHint';
import { SweepText } from '@/components/ui/SweepText/sweep-text';
import { useScrollTimeline } from '@/context/ScrollTimelineContext';
import {
  TOTAL_SPACER_HEIGHT,
  TITLE_ENTRANCE_END,
  TITLE_EXIT_START,
  TITLE_EXIT_END,
  LAYOUT_TIMING_OPACITY,
  LAYOUT_TIMING_Y,
  SCROLL_HINT_TIMING,
} from './About.constants';
import styles from './About.module.css';

export function About() {
  const { experienceRef, experienceProgress } = useScrollTimeline();
  const [shouldAnimateTitle, setShouldAnimateTitle] = useState(false);

  // Title transitions (Stage 1)
  const titleOpacity = useTransform(
    experienceProgress,
    [0, TITLE_ENTRANCE_END * 0.7, TITLE_EXIT_START, TITLE_EXIT_END],
    [0, 1, 1, 0],
  );

  const titleY = useTransform(
    experienceProgress,
    [0, TITLE_ENTRANCE_END, TITLE_EXIT_START, TITLE_EXIT_END],
    [80, 0, 0, -240],
  );

  const titleScale = useTransform(
    experienceProgress,
    [0, TITLE_ENTRANCE_END, TITLE_EXIT_END],
    [0.55, 1.0, 1.05],
  );

  const scrollHintOpacity = useTransform(
    experienceProgress,
    SCROLL_HINT_TIMING,
    [0, 0, 1, 1, 0],
  );

  // Layout Container Transition (Stage 2)
  const layoutOpacity = useTransform(
    experienceProgress,
    LAYOUT_TIMING_OPACITY,
    [0, 1, 1, 0],
  );

  const layoutY = useTransform(experienceProgress, LAYOUT_TIMING_Y, [40, 0]);

  // Handle title animation state on scroll
  useMotionValueEvent(experienceProgress, 'change', (progress) => {
    if (progress > 0.01) {
      if (!shouldAnimateTitle) setShouldAnimateTitle(true);
    } else if (shouldAnimateTitle) {
      setShouldAnimateTitle(false);
    }
  });

  return (
    <section id="experience" className={styles.section} aria-label="About Me">
      <div
        ref={experienceRef}
        className={styles.scrollSpacer}
        style={{ height: `${TOTAL_SPACER_HEIGHT}vh` }}
      >
        <div className={styles.stickyViewport}>
          <div className={styles.contentContainer}>
            {/* Title Overlay */}
            <motion.div
              className={styles.titleWrapper}
              style={{ opacity: titleOpacity, y: titleY, scale: titleScale }}
            >
              <div className={styles.titleBackground}>
                BIO_CATALOG: RUNNING // SOURCE: FERNANDO
              </div>
              <div className={styles.titleLabel}>
                <DecryptText
                  text="Who I Am"
                  shouldAnimate={shouldAnimateTitle}
                />
              </div>
              <SweepText
                as="h2"
                text="About Me"
                className={styles.aboutTitle}
                shouldAnimate={shouldAnimateTitle}
              />
            </motion.div>

            {/* Scroll Hint */}
            <ScrollHint
              opacity={scrollHintOpacity}
              className={styles.scrollHintDesktopOnly}
            />

            {/* Editorial Sticky Layout */}
            <motion.div
              className={styles.editorialLayout}
              style={{ opacity: layoutOpacity, y: layoutY }}
            >
              {/* Centered Editorial Prose Column */}
              <div className={styles.proseContainer}>
                {/* Paragraph 1 */}
                <div id="about-prose-0" className={styles.proseBlock}>
                  <p className={styles.paragraph}>
                    I&apos;m <span className={styles.accentWord}>Fernando</span>
                    ! I started my coding journey as a curious self-taught kid
                    hacking gaming consoles, later transitioning into
                    professional backend engineering. Since then, I’ve built
                    high-performance APIs and robust cloud architectures,
                    collaborating with multidisciplinary teams and scaling
                    systems that serve over half a million active users.
                  </p>
                </div>

                {/* Paragraph 2 */}
                <div id="about-prose-1" className={styles.proseBlock}>
                  <p className={styles.paragraph}>
                    A{' '}
                    <span className={styles.boldWord}>
                      self-learner at heart
                    </span>
                    , I thrive on mastering system internals and staying ahead
                    of engineering practices. My background in computer science
                    helps me tackle complex backend migrations and system
                    optimizations with clarity and efficiency, ensuring high
                    code quality under pressure.
                  </p>
                </div>

                {/* Paragraph 3 */}
                <div id="about-prose-2" className={styles.proseBlock}>
                  <p className={styles.paragraph}>
                    Outside of work, I’m passionate about{' '}
                    <span className={styles.boldWord}>
                      systems experimentation
                    </span>
                    , playing video games, and exploring computer history. I
                    also have a deep appreciation for hardware hacking, network
                    setups, and solving interesting system anomalies.
                  </p>
                </div>

                {/* Paragraph 4 */}
                <div id="about-prose-3" className={styles.proseBlock}>
                  <p className={styles.ctaParagraph}>
                    Let&apos;s build something extraordinary{' '}
                    <span className={styles.accentWord}>together</span>!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
