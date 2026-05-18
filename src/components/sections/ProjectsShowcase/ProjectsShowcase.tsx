'use client';

import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useSpring,
} from 'framer-motion';
import { useRef, useState, type RefObject } from 'react';
import { DecryptText } from '@/components/ui/DecryptText/decrypt-text';
import { SweepText } from '@/components/ui/SweepText/sweep-text';
import { ProjectSlide } from './ProjectSlide/ProjectSlide';
import { SCROLL_PAGES, PHASE_LENGTH } from './ProjectsShowcase.constants';
import { PROJECTS } from './ProjectsShowcase.data';
import styles from './ProjectsShowcase.module.css';

interface ProjectsShowcaseProps {
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

export function ProjectsShowcase({
  scrollContainerRef,
}: ProjectsShowcaseProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const activeRef = scrollContainerRef || localRef;
  const [shouldAnimateTitle, setShouldAnimateTitle] = useState(false);

  const totalSpacerHeight = SCROLL_PAGES * 100;

  // Track scroll progress of this section independently
  const { scrollYProgress } = useScroll({
    target: activeRef,
    offset: ['start start', 'end end'],
  });

  // Snapping project slider animation phases
  const projectsSnappedProgress = useTransform(scrollYProgress, (progress) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;

    const scrollPages = SCROLL_PAGES;
    const phaseLength = PHASE_LENGTH;

    if (progress < phaseLength) return progress;
    if (progress > 1 - phaseLength) return progress;

    const phase = Math.round(progress * scrollPages);
    return phase / scrollPages;
  });

  // Smooth snapping spring configuration
  const projectsProgress = useSpring(projectsSnappedProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.8,
    restDelta: 0.0001,
  });

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

  // Projects Title Y position: slides up from lower position (120px) to settled (0px) quickly, then exits upwards
  const titleY = useTransform(
    projectsProgress,
    [0, TITLE_ENTRANCE_END, TITLE_EXIT_END],
    [120, 0, -80],
  );

  // Projects Title Scale: zooms in to full size quickly, then continues expanding as it zooms out
  const titleScale = useTransform(
    projectsProgress,
    [0, TITLE_ENTRANCE_END, TITLE_EXIT_END],
    [0.55, 1.0, 1.05],
  );

  // Trigger title entrance animation when section reaches the projects phase
  useMotionValueEvent(projectsProgress, 'change', (progress) => {
    if (progress > 0.01 && !shouldAnimateTitle) {
      setShouldAnimateTitle(true);
    }
  });

  return (
    <section
      id="projects"
      className={styles.section}
      aria-label="Selected Projects"
    >
      <div
        ref={activeRef}
        className={styles.scrollSpacer}
        style={{ height: `${totalSpacerHeight}vh` }}
      >
        <div className={styles.stickyViewport}>
          {/* Projects Title */}
          <motion.div
            className={styles.titleWrapper}
            style={{ opacity: titleOpacity, y: titleY, scale: titleScale }}
          >
            <div className={styles.titleBackground}>
              CATALOG_ID: 2026_PRJ // SRC: PORTFOLIO_V4
            </div>
            <div className={styles.titleLabel}>
              <DecryptText text="Selected" shouldAnimate={shouldAnimateTitle} />
            </div>
            <SweepText
              as="h2"
              text="Projects"
              className={styles.projectsTitle}
              shouldAnimate={shouldAnimateTitle}
            />
          </motion.div>

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
    </section>
  );
}
