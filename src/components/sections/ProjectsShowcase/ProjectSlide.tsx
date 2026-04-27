'use client';

import {
  type MotionValue,
  motion,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { memo } from 'react';
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

export const ProjectSlide = memo(function ProjectSlide({
  project,
  index,
  scrollProgress,
}: ProjectSlideProps) {
  const reduceMotion = useReducedMotion();
  const isRight = project.side === 'right';

  const slideState = useTransform(scrollProgress, (progress) =>
    getProjectSlideState(progress, index),
  );

  const laptopX = useTransform(scrollProgress, (progress) => {
    if (reduceMotion) {
      return 0;
    }

    const transform = getLaptopTransform(
      progress,
      PROJECT_COUNT,
      SLIDE_CLIP_MAX_OFFSET,
    );
    return transform.xOffset;
  });

  const clipPath = useTransform(laptopX, (x) =>
    getSlideClipPath(x, project.side),
  );

  const visibility = useTransform(slideState, (state) =>
    state.active ? 'visible' : 'hidden',
  );

  const textOpacity = useTransform(slideState, (state) => {
    if (reduceMotion) {
      return 1;
    }

    if (index === 0) {
      const revealPhase = Math.min(1, state.reveal);
      return revealPhase * revealPhase;
    }

    if (index === PROJECT_COUNT - 1) {
      const fadeOutProgress = Math.min(1, Math.max(0, state.blur));
      const eased = 1 - fadeOutProgress;
      return eased * eased;
    }

    return 1;
  });

  return (
    <motion.div
      className={`${styles.slide} ${isRight ? styles.slideRight : styles.slideLeft}`}
      style={{
        clipPath: reduceMotion ? 'none' : clipPath,
        opacity: textOpacity,
        visibility,
      }}
    >
      <span className={styles.slideLabel}>Featured Project</span>
      <h3 className={styles.slideTitle}>{project.title}</h3>
      <p className={styles.slideDescription}>{project.description}</p>
    </motion.div>
  );
});

ProjectSlide.displayName = 'ProjectSlide';
