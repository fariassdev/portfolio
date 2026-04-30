'use client';

import {
  type MotionStyle,
  type MotionValue,
  motion,
  useMotionValue,
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

  // ── Mobile-only Entrance (applied via CSS variables) ──
  const mobileEntranceY = useTransform(slideState, (s) => (1 - s.reveal) * 50);
  const mobileEntranceOpacity = useTransform(slideState, (s) =>
    clamp(s.reveal * 2, 0, 1),
  );

  // ── SweepText & DecryptText sub-progress ──
  // Delay reveal so mobile slide/fade has time, and desktop laptop opens a bit
  // ── Unified Entrance Progress (Handles both directions) ──
  // This value goes 0 -> 1 when entering a project from either side.
  // scrolling down: reveal 0->1. scrolling up: 1-blur 0->1.
  const entranceProgress = useTransform(slideState, (s) =>
    Math.min(s.reveal, 1 - s.blur),
  );

  // Sweep reveal: driven by entranceProgress
  const delayedReveal = useTransform(entranceProgress, [0.3, 0.95], [0, 1], {
    clamp: true,
  });

  // Only entrance animations for these effects
  const noHide = useMotionValue(0);
  const isLabelActive = useTransform(entranceProgress, (v) => v > 0.6);

  // ── Unified Content Transition (Exit phase) ──
  // Fast fade in/out at the boundaries to ensure we don't see reverse sweep/scramble.
  const contentExitOpacity = useTransform(slideState, (s) => {
    const fadeIn = clamp(s.reveal / 0.2, 0, 1);
    const fadeOut = clamp((1 - s.blur) / 0.2, 0, 1);
    return Math.min(fadeIn, fadeOut);
  });

  const contentExitY = useTransform(slideState, (s) => {
    const forwardY = s.blur * -20;
    const backwardY = (1 - clamp(s.reveal / 0.2, 0, 1)) * 20;
    return forwardY + backwardY;
  });

  // ── Description Entrance (Exit is handled by parent) ──
  const descriptionEntranceOpacity = useTransform(
    entranceProgress,
    [0.2, 0.95],
    [0, 1],
    {
      clamp: true,
    },
  );
  const descriptionEntranceY = useTransform(
    entranceProgress,
    [0.2, 0.95],
    [20, 0],
    {
      clamp: true,
    },
  );

  return (
    <motion.div
      className={`${styles.slide} ${isRight ? styles.slideRight : styles.slideLeft}`}
      style={
        {
          clipPath: reduceMotion ? 'none' : clipPath,
          visibility,
          '--mobile-y': useTransform(mobileEntranceY, (y) => `${y}px`),
          '--mobile-opacity': mobileEntranceOpacity,
        } as MotionStyle
      }
    >
      <motion.div
        className={styles.slideContent}
        style={{
          opacity: contentExitOpacity,
          y: contentExitY,
        }}
      >
        <DecryptText
          text="Featured Project"
          className={styles.slideLabel}
          isActive={isLabelActive}
          delay={200}
        />

        <SweepText
          as="h3"
          text={project.title}
          className={styles.slideTitle}
          revealProgress={delayedReveal}
          hideProgress={noHide}
        />

        <motion.p
          className={styles.slideDescription}
          style={{
            opacity: descriptionEntranceOpacity,
            y: descriptionEntranceY,
          }}
        >
          {project.description}
        </motion.p>
      </motion.div>
    </motion.div>
  );
});

ProjectSlide.displayName = 'ProjectSlide';
