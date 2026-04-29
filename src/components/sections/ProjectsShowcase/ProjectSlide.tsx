'use client';

import {
  type MotionValue,
  motion,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { memo, useEffect, useState } from 'react';
import { DecryptText } from '@/components/ui/DecryptText/decrypt-text';
import { SweepText } from '@/components/ui/SweepText/sweep-text';
import { clamp } from '@/helpers/math.helpers';
import {
  PHASE_LENGTH,
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

  // Robust visibility: cover reveal, active, and blur phases
  const visibility = useTransform(scrollProgress, (progress) => {
    const start = 2 * index * PHASE_LENGTH;
    const end = start + 3.1 * PHASE_LENGTH; // Covers reveal (1), stable (2), and blur (0.1 extra for safety)
    return progress >= start && progress <= end ? 'visible' : 'hidden';
  });

  // Individual progress values for sub-animations
  const revealProgress = useTransform(slideState, (s) => s.reveal);
  const hideProgress = useTransform(slideState, (s) => s.blur);

  // Scramble label: Activate shortly after reveal starts, and stop as soon as blur begins
  const isLabelActive = useTransform(scrollProgress, (progress) => {
    const revealStart = 2 * index * PHASE_LENGTH;
    const blurStart = revealStart + 2 * PHASE_LENGTH;

    const isRevealedEnough = progress > revealStart + PHASE_LENGTH * 0.3; // Start earlier since it's the first phase
    const hasNotStartedBlurring = progress < blurStart + PHASE_LENGTH * 0.1;

    return isRevealedEnough && hasNotStartedBlurring;
  });

  // On mobile, we might want to disable the complex clipPath
  // and rely on the element-level animations for a cleaner look.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const slideClipPath = useTransform(clipPath, (cp) => {
    if (isMobile) return 'none';
    return cp;
  });

  // Description animation: slight delay and vertical movement
  const descriptionOpacity = useTransform(slideState, (s) => {
    const reveal = clamp((s.reveal - 0.2) / 0.8, 0, 1);
    const hide = clamp(s.blur / 0.8, 0, 1);
    return reveal * (1 - hide);
  });

  const descriptionY = useTransform(slideState, (s) => {
    const revealY = (1 - clamp((s.reveal - 0.2) / 0.8, 0, 1)) * 20;
    const hideY = clamp(s.blur / 0.8, 0, 1) * -20;
    return revealY + hideY;
  });

  return (
    <motion.div
      className={`${styles.slide} ${isRight ? styles.slideRight : styles.slideLeft}`}
      style={{
        clipPath: reduceMotion ? 'none' : slideClipPath,
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
