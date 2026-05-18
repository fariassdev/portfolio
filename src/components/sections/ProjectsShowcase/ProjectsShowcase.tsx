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
import { SCROLL_PAGES } from './ProjectsShowcase.constants';
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

    const scrollPages = PROJECTS.length * 2 + 3;
    const phaseLength = 1 / scrollPages;

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

  // Projects Title Opacity: fades in from 0 to 1 during entrance, fades out to 0 as laptop settles
  const titleOpacity = useTransform(
    projectsProgress,
    [0, 0.04, 0.08, 0.15],
    [0, 1, 1, 0],
  );

  // Projects Title Y position: slides up beautifully as it enters and continues sliding up as it exits
  const titleY = useTransform(projectsProgress, [0, 0.05, 0.15], [40, 0, -40]);

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
            style={{ opacity: titleOpacity, y: titleY }}
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
