'use client';

import { motion, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Suspense, useMemo } from 'react';
import {
  HERO_FADE_START,
  HERO_FADE_END,
} from '@/components/sections/Hero/hero.constants';
import type { LaptopSceneProps } from '@/components/sections/ProjectsShowcase/Laptop/LaptopScene';
import { PHASE_LENGTH } from '@/components/sections/ProjectsShowcase/ProjectsShowcase.constants';
import { PROJECTS } from '@/components/sections/ProjectsShowcase/ProjectsShowcase.data';
import { CrtScreen } from '@/components/ui/CrtScreen';
import { useScrollTimeline } from '@/context/ScrollTimelineContext';
import styles from './ViewportOverlay.module.css';

const LaptopScene = dynamic<LaptopSceneProps>(
  () =>
    import('../../sections/ProjectsShowcase/Laptop/LaptopScene').then((m) => ({
      default: m.LaptopScene,
    })),
  { ssr: false },
);

export function ViewportOverlay() {
  const { heroProgress, projectsProgress } = useScrollTimeline();

  // ── Master CRT intensity control ──────────────────────────────
  // Adjust these two constants to regulate ALL overlay effects at once.
  const BASE_CRT_INTENSITY = 1.0; // Full intensity in Hero
  const MIN_CRT_INTENSITY = 0; // 0% intensity in Projects
  const CRT_SCALE_MID = 4;
  const CRT_SCALE_MAX = 10;

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
    [1, CRT_SCALE_MID, CRT_SCALE_MAX],
  );

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
