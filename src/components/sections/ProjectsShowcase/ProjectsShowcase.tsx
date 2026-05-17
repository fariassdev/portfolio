'use client';

import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from 'framer-motion';
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

  // Entrance progress: tracks as the Projects section approaches the viewport (0 = enters bottom, 1 = reaches top)
  const { scrollYProgress: entranceProgress } = useScroll({
    target: scrollContainerRef,
    offset: ['start end', 'start start'],
  });

  // Scroll progress scoped entirely to the Projects experience (0 → 1)
  const smoothProgress = useScrollProgressAnimation(
    scrollContainerRef,
    SCROLL_PAGES,
  );

  // Projects Title Opacity: fades in from 0 to 1 during entrance, fades out to 0 as laptop settles
  const titleOpacity = useTransform(
    [entranceProgress, smoothProgress],
    ([latestEntrance = 0, latestSmooth = 0]: number[]) => {
      if (latestSmooth > 0) {
        if (latestSmooth <= 0.05) return 1;
        if (latestSmooth >= 0.15) return 0;
        return 1 - (latestSmooth - 0.05) / 0.1;
      } else {
        if (latestEntrance <= 0.3) return 0;
        return (latestEntrance - 0.3) / 0.7;
      }
    },
  ) as MotionValue<number>;

  // Projects Title Y position: slides up beautifully as it enters and continues sliding up as it exits
  const titleY = useTransform(
    [entranceProgress, smoothProgress],
    ([latestEntrance = 0, latestSmooth = 0]: number[]) => {
      if (latestSmooth > 0) {
        if (latestSmooth >= 0.15) return -40;
        return (latestSmooth / 0.15) * -40;
      } else {
        if (latestEntrance <= 0.3) return 60;
        return 60 - ((latestEntrance - 0.3) / 0.7) * 60;
      }
    },
  ) as MotionValue<number>;

  // Laptop Opacity: starts fading in in the distance during entrance, zooms to full focus on scroll
  const laptopOpacity = useTransform(
    [entranceProgress, smoothProgress],
    ([latestEntrance = 0, latestSmooth = 0]: number[]) => {
      if (latestSmooth > 0) {
        if (latestSmooth >= 0.15) return 1;
        return 0.15 + (latestSmooth / 0.15) * 0.85;
      } else {
        if (latestEntrance <= 0.3) return 0;
        return ((latestEntrance - 0.3) / 0.7) * 0.15;
      }
    },
  ) as MotionValue<number>;

  // Trigger title entrance animation when section reaches the viewport
  useMotionValueEvent(entranceProgress, 'change', (progress) => {
    if (progress > 0.5 && !shouldAnimateTitle) {
      setShouldAnimateTitle(true);
    }
  });

  const previewSources = useMemo(
    () => PROJECTS.map((project) => project.previewSrc),
    [],
  );

  return (
    <section
      id="projects"
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
