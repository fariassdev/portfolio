'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Suspense, useMemo, type RefObject } from 'react';
import { CrtScreen } from '@/components/ui/CrtScreen';
import type { LaptopSceneProps } from '../../sections/ProjectsShowcase/Laptop/LaptopScene';
import { PROJECTS } from '../../sections/ProjectsShowcase/ProjectsShowcase.data';
import styles from './ViewportOverlay.module.css';

const LaptopScene = dynamic<LaptopSceneProps>(
  () =>
    import('../../sections/ProjectsShowcase/Laptop/LaptopScene').then((m) => ({
      default: m.LaptopScene,
    })),
  { ssr: false },
);

interface ViewportOverlayProps {
  heroRef: RefObject<HTMLElement | null>;
  projectsRef: RefObject<HTMLDivElement | null>;
}

export function ViewportOverlay({
  heroRef,
  projectsRef,
}: ViewportOverlayProps) {
  // 1. Track Hero Scroll independently
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });

  // Snappy but perfectly smoothed spring configuration for Hero zoom-through
  const heroProgress = useSpring(heroScroll, {
    stiffness: 250,
    damping: 35,
    mass: 0.5,
    restDelta: 0.0001,
  });

  // CRT monitor bezel animations (centered fixed scale-up and dissolve)
  const crtScale = useTransform(heroProgress, [0, 0.6, 1], [1, 5, 15]);
  const crtOpacity = useTransform(heroProgress, [0, 0.4, 0.8], [1, 1, 0]);

  // 2. Track Projects Scroll independently
  const { scrollYProgress: projectsScroll } = useScroll({
    target: projectsRef,
    offset: ['start start', 'end end'],
  });

  // Snapping logic for project slider animation phases
  const projectsSnappedProgress = useTransform(projectsScroll, (progress) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;

    const scrollPages = PROJECTS.length * 2 + 3;
    const phaseLength = 1 / scrollPages;

    if (progress < phaseLength) return progress;
    if (progress > 1 - phaseLength) return progress;

    const phase = Math.round(progress * scrollPages);
    return phase / scrollPages;
  });

  // Smooth snapping spring configuration for projects slides
  const projectsProgress = useSpring(projectsSnappedProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.8,
    restDelta: 0.0001,
  });

  // Laptop opening, scale and fade inside the fixed space
  const laptopOpacity = useTransform(projectsProgress, [0, 0.05], [0, 1]);

  const phaseLen = 1 / Math.max(PROJECTS.length * 2 + 3, 1);
  const laptopScrollProgress = useTransform(
    projectsProgress,
    [0, 0.05, 1],
    [0, phaseLen, 1],
  );

  const previewSources = useMemo(
    () => PROJECTS.map((project) => project.previewSrc),
    [],
  );

  return (
    <div className={styles.viewportOverlay}>
      {/* CRT screen overlay — sits on top of 3D laptop but behind HTML text content */}
      <CrtScreen opacity={crtOpacity} scale={crtScale} />

      {/* 3D Laptop Scene */}
      <motion.div
        className={styles.canvasWrapper}
        style={{ opacity: laptopOpacity }}
      >
        <Suspense fallback={null}>
          <LaptopScene
            scrollProgress={laptopScrollProgress}
            previewSources={previewSources}
          />
        </Suspense>
      </motion.div>
    </div>
  );
}
