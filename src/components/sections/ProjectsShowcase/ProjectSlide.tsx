'use client';

import { type MotionValue, motion, useTransform } from 'framer-motion';
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
