'use client';

import { type MotionValue, motion } from 'framer-motion';
import { memo } from 'react';
import { DecryptText } from '@/components/ui/DecryptText/decrypt-text';
import { SweepText } from '@/components/ui/SweepText/sweep-text';
import styles from './ProjectsShowcase.module.css';
import type { Project } from './ProjectsShowcase.types';
import { useSlideAnimation } from './use-slide-animation';

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

  // Unified hook consolidates all animation logic
  const animation = useSlideAnimation(scrollProgress, index, project.side);

  return (
    <motion.div
      className={`${styles.slide} ${isRight ? styles.slideRight : styles.slideLeft}`}
      style={{
        clipPath: animation.clipPath,
        visibility: animation.visibility,
        y: animation.mobileEntranceY,
        opacity: animation.mobileEntranceOpacity,
      }}
    >
      <motion.div
        className={styles.slideContent}
        style={{
          opacity: animation.contentOpacity,
          y: animation.contentY,
        }}
      >
        <div className={styles.slideLabel}>
          <DecryptText
            text="Featured Project"
            isActive={animation.isLabelActive}
            delay={200}
          />
        </div>

        <SweepText
          as="h3"
          text={project.title}
          className={styles.slideTitle}
          revealProgress={animation.sweepReveal}
        />

        <p className={styles.slideDescription}>{project.description}</p>
      </motion.div>
    </motion.div>
  );
});

ProjectSlide.displayName = 'ProjectSlide';
