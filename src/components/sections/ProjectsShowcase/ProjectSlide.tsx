'use client';

import {
  type MotionValue,
  motion,
  useMotionTemplate,
  useTransform,
} from 'framer-motion';
import { memo } from 'react';
import { getProjectSlideState, type Project } from './projects.constants';
import styles from './projects.module.css';

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
  const isRight = project.side === 'right';

  const slideState = useTransform(scrollProgress, (progress) =>
    getProjectSlideState(progress, index),
  );
  const revealProgress = useTransform(slideState, (state) => state.reveal);

  /* Clip-path reveal from the edge where the laptop isn't.
     If text is on the right, reveal from right→left (inset-left shrinks).
     If text is on the left, reveal from left→right (inset-right shrinks). */
  const hiddenFractionPercent = useTransform(
    revealProgress,
    (value) => (1 - value) * 100,
  );
  const clipPath = isRight
    ? useMotionTemplate`inset(0 0 0 ${hiddenFractionPercent}%)`
    : useMotionTemplate`inset(0 ${hiddenFractionPercent}% 0 0)`;

  /* Opacity: combine reveal with blur-fade */
  const slideOpacity = useTransform(slideState, (state) => {
    if (!state.active) {
      return 0;
    }

    return state.reveal * (1 - state.blur * 0.8);
  });

  /* Subtle vertical slide-up during reveal */
  const translateY = useTransform(revealProgress, (value) => (1 - value) * 32);
  const visibility = useTransform(slideState, (state) =>
    state.active ? 'visible' : 'hidden',
  );

  return (
    <motion.div
      className={`${styles.slide} ${isRight ? styles.slideRight : styles.slideLeft}`}
      style={{
        clipPath,
        opacity: slideOpacity,
        y: translateY,
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
