'use client';

import {
  type MotionStyle,
  type MotionValue,
  motion,
  useMotionValue,
  useMotionValueEvent,
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

  const visibility = useTransform(slideState, (state) =>
    state.active ? 'visible' : 'hidden',
  );

  const clipPath = useTransform(scrollProgress, (progress) => {
    if (reduceMotion) return 'none';
    const transform = getLaptopTransform(
      progress,
      PROJECT_COUNT,
      SLIDE_CLIP_MAX_OFFSET,
    );
    return getSlideClipPath(transform.xOffset, project.side);
  });

  const mobileEntranceY = useTransform(
    slideState,
    (state) => (1 - state.reveal) * 50,
  );
  const mobileEntranceOpacity = useTransform(slideState, (state) =>
    clamp(state.reveal * 2, 0, 1),
  );

  const entranceProgress = useTransform(slideState, (state) =>
    Math.min(state.reveal, 1 - state.blur),
  );

  const latchedProgress = useMotionValue(0);
  useMotionValueEvent(entranceProgress, 'change', (progressValue) => {
    if (progressValue > latchedProgress.get()) {
      latchedProgress.set(progressValue);
    } else if (progressValue < 0.05) {
      latchedProgress.set(0);
    }
  });

  const sweepReveal = useTransform(latchedProgress, [0.3, 0.95], [0, 1], {
    clamp: true,
  });

  const isLabelActive = useTransform(
    latchedProgress,
    (progressValue) => progressValue > 0.6,
  );

  const contentOpacity = useTransform(slideState, (state) => {
    const fadeIn = clamp(state.reveal / 0.2, 0, 1);
    const fadeOut = clamp((1 - state.blur) / 0.2, 0, 1);
    return Math.min(fadeIn, fadeOut);
  });

  const contentY = useTransform(slideState, (state) => {
    const forwardY = state.blur * -20;
    const backwardY = (1 - clamp(state.reveal / 0.2, 0, 1)) * 20;
    return forwardY + backwardY;
  });

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
          opacity: contentOpacity,
          y: contentY,
        }}
      >
        <div className={styles.slideLabel}>
          <DecryptText
            text="Featured Project"
            isActive={isLabelActive}
            delay={200}
          />
        </div>

        <div>
          <SweepText
            as="h3"
            text={project.title}
            className={styles.slideTitle}
            revealProgress={sweepReveal}
          />
        </div>

        <p className={styles.slideDescription}>{project.description}</p>
      </motion.div>
    </motion.div>
  );
});

ProjectSlide.displayName = 'ProjectSlide';
