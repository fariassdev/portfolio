'use client';

import { motion, useTransform, useMotionValueEvent } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Suspense, useMemo, useRef, useState } from 'react';
import { DecryptText } from '@/components/ui/DecryptText/decrypt-text';
import { SweepText } from '@/components/ui/SweepText/sweep-text';
import { useScrollProgressAnimation } from '@/hooks/use-scroll-progress-animation';
import type { LaptopSceneProps } from './Laptop/LaptopScene';
import { ProjectSlide } from './ProjectSlide/ProjectSlide';
import { SCROLL_PAGES } from './ProjectsShowcase.constants';
import { PROJECTS } from './ProjectsShowcase.data';
import styles from './ProjectsShowcase.module.css';

const LaptopScene = dynamic<LaptopSceneProps>(
  () =>
    import('./Laptop/LaptopScene').then((m) => ({ default: m.LaptopScene })),
  { ssr: false },
);

const PROJECT_PHASE_VH = 100;

export function ProjectsShowcase() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAnimateTitle, setShouldAnimateTitle] = useState(false);

  const totalSpacerHeight = SCROLL_PAGES * PROJECT_PHASE_VH;

  // Scroll progress scoped entirely to the Projects experience (0 → 1)
  const smoothProgress = useScrollProgressAnimation(
    scrollContainerRef,
    SCROLL_PAGES,
  );

  // Projects Title: fades in immediately, then fades out as laptop appears
  const titleOpacity = useTransform(smoothProgress, [0, 0.05, 0.15], [0, 1, 0]);
  const titleY = useTransform(smoothProgress, [0, 0.15], [40, -40]);

  // Laptop: hidden initially, fades in after title disappears
  const laptopOpacity = useTransform(smoothProgress, [0.1, 0.15], [0, 1]);

  // Trigger title entrance animation
  useMotionValueEvent(smoothProgress, 'change', (progress) => {
    if (progress > 0 && !shouldAnimateTitle) {
      setShouldAnimateTitle(true);
    }
  });

  const previewSources = useMemo(
    () => PROJECTS.map((project) => project.previewSrc),
    [],
  );

  return (
    <section
      id="work"
      className={styles.section}
      aria-label="Selected Projects"
    >
      <div
        ref={scrollContainerRef}
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

          {/* 3D Laptop Scene */}
          <motion.div
            className={styles.canvasWrapper}
            style={{ opacity: laptopOpacity }}
          >
            <Suspense fallback={null}>
              <LaptopScene
                scrollProgress={smoothProgress}
                previewSources={previewSources}
              />
            </Suspense>
          </motion.div>

          {/* Project Slides */}
          <div className={styles.slidesContainer}>
            {PROJECTS.map((project, index) => (
              <ProjectSlide
                key={project.id}
                project={project}
                index={index}
                scrollProgress={smoothProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
