'use client';

import {
  type MotionValue,
  motion,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { memo } from 'react';
import { DecryptText } from '@/components/ui/DecryptText/decrypt-text';
import { SweepText } from '@/components/ui/SweepText/sweep-text';
import { clamp } from '@/helpers/math.helpers';
import {
  PROJECT_COUNT,
  SLIDE_CLIP_MAX_OFFSET,
} from './ProjectsShowcase.constants';
import {
  getLaptopTransform,
  getProjectSlideState,
  getSlideClipPath,
} from './ProjectsShowcase.helpers';
import styles from './ProjectsShowcase.module.css';
import type { Project } from './ProjectsShowcase.types';

interface ProjectSlideProps {
  project: Project;
  index: number;
  scrollProgress: MotionValue<number>;
}

/**
 * Renders a single project's text overlay (label, title, description)
 * alongside the 3D laptop scene.
 *
 * All timing is derived from a single `slideState` object to avoid
 * duplicated phase calculations. The slideState provides:
 *  - `reveal` (0→1): controls text entrance
 *  - `blur` (0→1): controls text exit
 *  - `active`: whether this slide is in its visible window
 */
export const ProjectSlide = memo(function ProjectSlide({
  project,
  index,
  scrollProgress,
}: ProjectSlideProps) {
  const reduceMotion = useReducedMotion();
  const isRight = project.side === 'right';

  // ── Single source of truth for all sub-animation timing ──
  const slideState = useTransform(scrollProgress, (progress) =>
    getProjectSlideState(progress, index),
  );

  // ── Visibility: derived from slideState.active ──
  const visibility = useTransform(slideState, (s) =>
    s.active ? 'visible' : 'hidden',
  );

  // ── Clip path (desktop only — CSS handles mobile via media query) ──
  const clipPath = useTransform(scrollProgress, (progress) => {
    if (reduceMotion) return 'none';
    const transform = getLaptopTransform(
      progress,
      PROJECT_COUNT,
      SLIDE_CLIP_MAX_OFFSET,
    );
    return getSlideClipPath(transform.xOffset, project.side);
  });

  // ── SweepText sub-progress values ──
  const revealProgress = useTransform(slideState, (s) => s.reveal);
  const hideProgress = useTransform(slideState, (s) => s.blur);

  // ── DecryptText activation: active when reveal is past 30% and blur hasn't started ──
  const isLabelActive = useTransform(slideState, (s) => {
    return s.reveal > 0.3 && s.blur < 0.05;
  });

  // ── Description opacity: fade in after 20% reveal, fade out during blur ──
  const descriptionOpacity = useTransform(slideState, (s) => {
    const fadeIn = clamp((s.reveal - 0.2) / 0.8, 0, 1);
    const fadeOut = clamp(s.blur / 0.8, 0, 1);
    return fadeIn * (1 - fadeOut);
  });

  // ── Description Y offset: slide up on reveal, slide down on blur ──
  const descriptionY = useTransform(slideState, (s) => {
    const revealY = (1 - clamp((s.reveal - 0.2) / 0.8, 0, 1)) * 20;
    const hideY = clamp(s.blur / 0.8, 0, 1) * -20;
    return revealY + hideY;
  });

  return (
    <motion.div
      className={`${styles.slide} ${isRight ? styles.slideRight : styles.slideLeft}`}
      style={{
        clipPath: reduceMotion ? 'none' : clipPath,
        visibility,
      }}
    >
      <div className={styles.slideContent}>
        <DecryptText
          text="Featured Project"
          className={styles.slideLabel}
          isActive={isLabelActive}
          delay={200}
        />

        <SweepText
          text={project.title}
          as="h3"
          className={styles.slideTitle}
          revealProgress={revealProgress}
          hideProgress={hideProgress}
        />

        <motion.p
          className={styles.slideDescription}
          style={{
            opacity: descriptionOpacity,
            y: descriptionY,
          }}
        >
          {project.description}
        </motion.p>
      </div>
    </motion.div>
  );
});

ProjectSlide.displayName = 'ProjectSlide';
