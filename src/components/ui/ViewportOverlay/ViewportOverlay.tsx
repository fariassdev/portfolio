'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Suspense, useMemo, type RefObject } from 'react';
import {
  HERO_FADE_START,
  HERO_FADE_END,
} from '@/components/sections/Hero/hero.constants';
import type { LaptopSceneProps } from '@/components/sections/ProjectsShowcase/Laptop/LaptopScene';
import {
  SCROLL_PAGES,
  PHASE_LENGTH,
} from '@/components/sections/ProjectsShowcase/ProjectsShowcase.constants';
import { PROJECTS } from '@/components/sections/ProjectsShowcase/ProjectsShowcase.data';
import { CrtScreen } from '@/components/ui/CrtScreen';
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

  // ── Master CRT intensity control ──────────────────────────────
  // Adjust these two constants to regulate ALL overlay effects at once.
  const BASE_CRT_INTENSITY = 1.0; // Full intensity in Hero
  const MIN_CRT_INTENSITY = 0; // 0% intensity in Projects

  // Opacity fades from full → 0 as user scrolls, synchronized to finish completely by HERO_FADE_END progress
  const crtOpacity = useTransform(
    heroProgress,
    [0, HERO_FADE_START, HERO_FADE_END],
    [BASE_CRT_INTENSITY, BASE_CRT_INTENSITY, MIN_CRT_INTENSITY],
  );

  // Scale zooms up so fine effects (scanlines, pixels, vignette) dissolve naturally, finishing at HERO_FADE_END progress
  const crtScale = useTransform(
    heroProgress,
    [0, HERO_FADE_START, HERO_FADE_END],
    [1, 5, 15],
  );

  // 2. Track Projects Scroll independently
  const { scrollYProgress: projectsScroll } = useScroll({
    target: projectsRef,
    offset: ['start start', 'end end'],
  });

  // Snapping logic for project slider animation phases
  const projectsSnappedProgress = useTransform(projectsScroll, (progress) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;

    const scrollPages = SCROLL_PAGES;
    const phaseLength = PHASE_LENGTH;

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

  // Laptop opening, scale and fade inside the fixed space (tuned to enter during Phase 1)
  const laptopOpacity = useTransform(
    projectsProgress,
    [PHASE_LENGTH, PHASE_LENGTH * 1.8],
    [0, 1],
  );

  const laptopScrollProgress = useTransform(
    projectsProgress,
    [PHASE_LENGTH, PHASE_LENGTH * 1.8, 1],
    [0, PHASE_LENGTH, 1],
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
