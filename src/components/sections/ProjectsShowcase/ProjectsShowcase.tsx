'use client';

import { motion, useTransform, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { DecryptText } from '@/components/ui/DecryptText/decrypt-text';
import { ScrollHint } from '@/components/ui/ScrollHint';
import { SweepText } from '@/components/ui/SweepText/sweep-text';
import { useScrollTimeline } from '@/context/ScrollTimelineContext';
import { ProjectSlide } from './ProjectSlide/ProjectSlide';
import { SCROLL_PAGES, PHASE_LENGTH } from './ProjectsShowcase.constants';
import { PROJECTS } from './ProjectsShowcase.data';
import styles from './ProjectsShowcase.module.css';

export function ProjectsShowcase() {
  const { projectsRef, projectsProgress } = useScrollTimeline();
  const [shouldAnimateTitle, setShouldAnimateTitle] = useState(false);

  const totalSpacerHeight = SCROLL_PAGES * 100;

  // Choreographed animation timing constants (tuned so that title enters first, then laptop follows)
  const TITLE_ENTRANCE_END = PHASE_LENGTH * 0.45; // Title settles halfway through Phase 0 (approx 0.04)
  const TITLE_EXIT_START = PHASE_LENGTH * 1.2; // Title stays solid while laptop is opening, starts exiting in Phase 1 (approx 0.11)
  const TITLE_EXIT_END = PHASE_LENGTH * 1.8; // Title exits fully before Phase 2 starts (approx 0.16)

  // Projects Title Opacity: fades in rapidly, stays solid, then fades out as first project details appear
  const titleOpacity = useTransform(
    projectsProgress,
    [0, TITLE_ENTRANCE_END * 0.7, TITLE_EXIT_START, TITLE_EXIT_END],
    [0, 1, 1, 0],
  );

  // Projects Title Y position: starts slightly lower (80px), settles in dead center (0px), then slides up to top of screen (-240px)
  const titleY = useTransform(
    projectsProgress,
    [0, TITLE_ENTRANCE_END, TITLE_EXIT_START, TITLE_EXIT_END],
    [80, 0, 0, -240],
  );

  // Projects Title Scale: zooms in to full size quickly, then continues expanding as it zooms out
  const titleScale = useTransform(
    projectsProgress,
    [0, TITLE_ENTRANCE_END, TITLE_EXIT_END],
    [0.55, 1.0, 1.05],
  );

  // Projects Scroll Hint Opacity: starts invisible, fades in as title settles, then fades out as we scroll to projects
  const scrollHintOpacity = useTransform(
    projectsProgress,
    [
      0,
      TITLE_ENTRANCE_END * 0.4,
      TITLE_ENTRANCE_END,
      TITLE_EXIT_START * 0.5,
      TITLE_EXIT_START,
    ],
    [0, 0, 1, 1, 0],
  );

  // Trigger title entrance animation when section reaches the projects phase, and reset when scrolling back up
  useMotionValueEvent(projectsProgress, 'change', (progress) => {
    if (progress > 0.01) {
      if (!shouldAnimateTitle) {
        setShouldAnimateTitle(true);
      }
    } else if (shouldAnimateTitle) {
      setShouldAnimateTitle(false);
    }
  });

  return (
    <section
      id="projects"
      className={styles.section}
      aria-label="Selected Projects"
    >
      <div
        ref={projectsRef}
        className={styles.scrollSpacer}
        style={{ height: `${totalSpacerHeight}vh` }}
      >
        <div className={styles.stickyViewport}>
          <div className={styles.contentContainer}>
            {/* Projects Title */}
            <motion.div
              className={styles.titleWrapper}
              style={{ opacity: titleOpacity, y: titleY, scale: titleScale }}
            >
              <div className={styles.titleBackground}>
                CATALOG_ID: 2026_PRJ // SRC: PORTFOLIO_V4
              </div>
              <div className={styles.titleLabel}>
                <DecryptText
                  text="Selected"
                  shouldAnimate={shouldAnimateTitle}
                />
              </div>
              <SweepText
                as="h2"
                text="Projects"
                className={styles.projectsTitle}
                shouldAnimate={shouldAnimateTitle}
              />
            </motion.div>

            {/* Scroll Hint */}
            <ScrollHint opacity={scrollHintOpacity} />

            {/* Project Slides */}
            <div className={styles.slidesContainer}>
              {PROJECTS.map((project, index) => (
                <ProjectSlide
                  key={project.id}
                  project={project}
                  index={index}
                  scrollProgress={projectsProgress}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
