'use client';

import {
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
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

  // Smoothly snap to the nearest animation phase.
  // This satisfies the "no intermediate position" requirement visually.
  const smoothProgress = useSpring(
    useTransform(scrollYProgress, (v) => {
      if (v <= 0) return 0;
      if (v >= 1) return 1;
      const phase = Math.round(v * SCROLL_PAGES);
      return phase / SCROLL_PAGES;
    }),
    {
      stiffness: 100,
      damping: 30,
      mass: 0.5,
      restDelta: 0.0001,
    },
  );

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
                scrollProgress={smoothProgress}
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
                  scrollProgress={smoothProgress}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
