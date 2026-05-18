'use client';

import { type MotionValue, motion, useMotionValueEvent } from 'framer-motion';
import { memo, useState } from 'react';
import { Button } from '@/components/ui/Button';
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

const ExternalLinkIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

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
        opacity: animation.mobileEntranceOpacity,
        zIndex: 10 - index,
      }}
    >
      <motion.div
        className={styles.slideContent}
        style={{
          opacity: animation.contentOpacity,
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

        {project.technologies && project.technologies.length > 0 && (
          <div className={styles.techStack}>
            {project.technologies.map((tech) => (
              <span
                key={tech.name}
                className={styles.techTag}
                title={tech.name}
              >
                <i className={`${tech.iconClass} colored`} aria-hidden="true" />
                <span className={styles.techName}>{tech.name}</span>
              </span>
            ))}
          </div>
        )}

        {(project.githubUrl || project.liveUrl) && (
          <div className={styles.slideButtons}>
            {project.githubUrl && (
              <Button
                href={project.githubUrl}
                variant="secondary"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${project.title} source code on GitHub`}
              >
                <i className="devicon-github-original" aria-hidden="true" />
                View on Github
              </Button>
            )}
            {project.liveUrl && (
              <Button
                href={project.liveUrl}
                variant="primary"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open live demo for ${project.title}`}
              >
                <ExternalLinkIcon />
                Live Demo
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
});

ProjectSlide.displayName = 'ProjectSlide';
