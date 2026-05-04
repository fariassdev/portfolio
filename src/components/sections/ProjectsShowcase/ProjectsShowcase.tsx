'use client';

import dynamic from 'next/dynamic';
import { Suspense, useMemo, useRef } from 'react';
import type { LaptopSceneProps } from './LaptopScene';
import { ProjectSlide } from './ProjectSlide';
import { SCROLL_PAGES } from './ProjectsShowcase.constants';
import { PROJECTS } from './ProjectsShowcase.data';
import styles from './ProjectsShowcase.module.css';
import { useScrollProgressAnimation } from './use-scroll-progress-animation';

const LaptopScene = dynamic<LaptopSceneProps>(
  () => import('./LaptopScene').then((m) => ({ default: m.LaptopScene })),
  { ssr: false },
);

export function ProjectsShowcase() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Simplified animation: just scroll-based progress
  const smoothProgress = useScrollProgressAnimation(
    scrollContainerRef,
    SCROLL_PAGES,
  );

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
        style={{ height: `${SCROLL_PAGES * 100}vh` }}
      >
        <div className={styles.stickyViewport}>
          <div className={styles.canvasWrapper}>
            <Suspense fallback={null}>
              <LaptopScene
                scrollProgress={smoothProgress}
                previewSources={previewSources}
              />
            </Suspense>
          </div>

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
