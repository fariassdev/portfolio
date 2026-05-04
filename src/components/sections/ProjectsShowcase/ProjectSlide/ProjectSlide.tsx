'use client';

import { type MotionValue, motion, useMotionValueEvent } from 'framer-motion';
import { memo, useState } from 'react';
import { DecryptText } from '@/components/ui/DecryptText';
import { SweepText } from '@/components/ui/SweepText';
import type { Project } from '../ProjectsShowcase.types';
import styles from './ProjectSlide.module.css';
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

  // Sync motion value to local state for simple boolean prop access
  const [shouldAnimate, setShouldAnimate] = useState(
    animation.shouldAnimateText.get(),
  );

  useMotionValueEvent(animation.shouldAnimateText, 'change', (latest) => {
    setShouldAnimate(latest);
  });

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
            shouldAnimate={shouldAnimate}
            delay={200}
          />
        </div>

        <SweepText
          as="h3"
          text={project.title}
          className={styles.slideTitle}
          shouldAnimate={shouldAnimate}
        />

        <p className={styles.slideDescription}>{project.description}</p>
      </motion.div>
    </motion.div>
  );
});

ProjectSlide.displayName = 'ProjectSlide';
