'use client';

import { useMotionValue, useReducedMotion, useScroll } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import type { LaptopSceneProps } from './LaptopScene';
import { ProjectSlide } from './ProjectSlide';
import { SCROLL_PAGES } from './ProjectsShowcase.constants';
import { PROJECTS } from './ProjectsShowcase.data';
import styles from './ProjectsShowcase.module.css';

const LaptopScene = dynamic<LaptopSceneProps>(
  () => import('./LaptopScene').then((m) => ({ default: m.LaptopScene })),
  { ssr: false },
);

export function ProjectsShowcase() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: spacerRef,
    offset: ['start start', 'end end'],
  });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    },
    [mouseX, mouseY],
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove, prefersReducedMotion]);

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
        ref={spacerRef}
        className={styles.scrollSpacer}
        style={{ height: `${SCROLL_PAGES * 100}vh` }}
      >
        <div className={styles.stickyViewport}>
          <div className={styles.canvasWrapper}>
            <Suspense fallback={null}>
              <LaptopScene
                scrollProgress={scrollYProgress}
                mouseX={mouseX}
                mouseY={mouseY}
                previewSources={previewSources}
                reducedMotion={Boolean(prefersReducedMotion)}
              />
            </Suspense>
          </div>

          <div className={styles.slidesContainer}>
            {PROJECTS.map((project, i) => {
              return (
                <ProjectSlide
                  key={project.id}
                  project={project}
                  index={i}
                  scrollProgress={scrollYProgress}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
