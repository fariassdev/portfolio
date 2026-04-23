'use client';

import { useMotionValue, useReducedMotion, useScroll } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import type { LaptopSceneProps } from './LaptopScene';
import { ProjectSlide } from './ProjectSlide';
import { PROJECTS, SCROLL_PAGES } from './projects.constants';
import styles from './projects.module.css';

/* Dynamic import prevents Three.js / WebGL from running on the server */
const LaptopScene = dynamic<LaptopSceneProps>(
  () => import('./LaptopScene').then((m) => ({ default: m.LaptopScene })),
  { ssr: false },
);

/* ------------------------------------------------------------------ */
/*  ProjectsShowcase                                                   */
/* ------------------------------------------------------------------ */

export function ProjectsShowcase() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const mouseFrameRef = useRef<number | null>(null);
  const pendingMouseRef = useRef<{ x: number; y: number } | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  /* framer-motion scroll tracking */
  const { scrollYProgress } = useScroll({
    target: spacerRef,
    offset: ['start start', 'end end'],
  });

  const flushMouseToMotionValues = useCallback(() => {
    const nextMouse = pendingMouseRef.current;
    mouseFrameRef.current = null;
    if (!nextMouse) {
      return;
    }

    mouseX.set(nextMouse.x);
    mouseY.set(nextMouse.y);
    pendingMouseRef.current = null;
  }, [mouseX, mouseY]);

  /* Mouse tracking (normalized -1..1), batched with requestAnimationFrame */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      pendingMouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };

      if (mouseFrameRef.current !== null) {
        return;
      }

      mouseFrameRef.current = window.requestAnimationFrame(
        flushMouseToMotionValues,
      );
    },
    [flushMouseToMotionValues],
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseFrameRef.current !== null) {
        window.cancelAnimationFrame(mouseFrameRef.current);
      }
    };
  }, [handleMouseMove, prefersReducedMotion]);

  const images = useMemo(() => PROJECTS.map((project) => project.image), []);

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
          {/* 3D Canvas — always visible; reduced-motion users get a static laptop */}
          <div className={styles.canvasWrapper}>
            <Suspense fallback={null}>
              <LaptopScene
                scrollProgress={scrollYProgress}
                mouseX={mouseX}
                mouseY={mouseY}
                images={images}
                reducedMotion={Boolean(prefersReducedMotion)}
              />
            </Suspense>
          </div>

          {/* HTML Slide Overlays */}
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
