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

  const laptopX = useTransform(scrollProgress, (progress) => {
    const ease = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const n = 2;
    const totalPhases = n * 2 + 1;
    const phaseLength = 1 / totalPhases;

    if (progress < phaseLength) return 0;

    let activeIndex = Math.floor((progress - phaseLength) / (phaseLength * 2));
    activeIndex = Math.max(0, Math.min(n - 1, activeIndex));
    const isEven = activeIndex % 2 === 0;
    const targetX = isEven ? -25 : 25;
    const oppositeX = isEven ? 25 : -25;
    const projectStartPhase = phaseLength + activeIndex * phaseLength * 2;
    const t = Math.max(
      0,
      Math.min(1, (progress - projectStartPhase) / phaseLength),
    );

    let xOffset = 0;
    if (activeIndex === 0 && t < 1) {
      xOffset = ease(t) * targetX;
    } else if (
      activeIndex === n - 1 &&
      progress >= projectStartPhase + phaseLength
    ) {
      const tOut = Math.max(
        0,
        Math.min(
          1,
          (progress - (projectStartPhase + phaseLength)) / phaseLength,
        ),
      );
      xOffset = targetX + ease(tOut) * (0 - targetX);
    } else {
      if (t < 1) xOffset = oppositeX + ease(t) * (targetX - oppositeX);
      else xOffset = targetX;
    }
    return xOffset;
  });

  const clipPath = useTransform(laptopX, (x) => {
    const xPercent = 50 + x;
    const laptopWidth = 24;
    const tilt = (x / 25) * 8;

    if (isRight) {
      const edge = xPercent + laptopWidth / 2;
      const v = ((edge - 55) / 45) * 100;
      const x1 = v + tilt;
      const x2 = v - tilt;
      return `polygon(${x1}% -20%, 120% -20%, 120% 120%, ${x2}% 120%)`;
    } else {
      const edge = xPercent - laptopWidth / 2;
      const v = ((45 - edge) / 45) * 100;
      const x1 = 100 - v - tilt;
      const x2 = 100 - v + tilt;
      return `polygon(-20% -20%, ${x1}% -20%, ${x2}% 120%, -20% 120%)`;
    }
  });

  const visibility = useTransform(slideState, (state) =>
    state.active ? 'visible' : 'hidden',
  );

  return (
    <motion.div
      className={`${styles.slide} ${isRight ? styles.slideRight : styles.slideLeft}`}
      style={{
        clipPath,
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
