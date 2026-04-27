'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { memo, useMemo } from 'react';
import styles from './ProjectsShowcase.module.css';
import type { ScreenTransition } from './ProjectsShowcase.types';

interface LaptopScreenProps {
  mediaPaths: readonly string[];
  transition: ScreenTransition;
}

/**
 * MediaRenderer Component
 * Optimized to handle images and videos efficiently.
 */
const MediaRenderer = memo(
  ({
    src,
    style,
    className,
  }: {
    src?: string;
    style?: React.CSSProperties;
    className?: string;
  }) => {
    if (!src) return <div className={styles.screenPlaceholder} />;

    const isVideo = src.endsWith('.mp4') || src.endsWith('.webm');

    if (isVideo) {
      return (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className={className || styles.screenMedia}
          style={style}
        />
      );
    }

    return (
      <Image
        src={src}
        alt="Project"
        width={1280}
        height={832}
        className={className || styles.screenMedia}
        style={style}
        priority
      />
    );
  },
);

MediaRenderer.displayName = 'MediaRenderer';

/**
 * LaptopScreen Component
 *
 * Optimized & Distilled "Digital Morph".
 * Uses a limited number of horizontal strips for a scramble-like effect
 * with minimal performance overhead.
 */
export const LaptopScreen = memo(
  ({ mediaPaths, transition }: LaptopScreenProps) => {
    const fromPath = mediaPaths[transition.fromIndex];
    const toPath = mediaPaths[transition.toIndex];
    const isTransitioning = transition.blend > 0 && transition.blend < 1;

    // Distilled Grid: 8 horizontal strips are enough for a techy feel
    const STRIP_COUNT = 8;

    const strips = useMemo(() => {
      return Array.from({ length: STRIP_COUNT }).map((_, i) => {
        // Unique delay/offset for each strip
        const delay = ((Math.sin(i * 0.5) + 1) / 2) * 0.3;
        const progress = Math.max(
          0,
          Math.min(1, (transition.blend - delay) / 0.7),
        );

        if (progress <= 0) return null;

        return (
          <div
            key={i}
            className={styles.screenStripe}
            style={{
              top: `${(i * 100) / STRIP_COUNT}%`,
              height: `${100 / STRIP_COUNT}%`,
              opacity: progress,
              transform: `translateX(${(1 - progress) * 20}px)`,
            }}
          >
            <MediaRenderer
              src={toPath}
              style={{
                height: `${STRIP_COUNT * 100}%`,
                top: `${-i * 100}%`,
                position: 'absolute',
                width: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        );
      });
    }, [toPath, transition.blend]);

    return (
      <div
        className={styles.screenContent}
        style={{ opacity: transition.opacity }}
      >
        {/* Base Layer */}
        <div
          className={styles.screenLayer}
          style={{
            filter: isTransitioning
              ? `blur(${transition.blend * 2}px)`
              : 'none',
          }}
        >
          <MediaRenderer src={fromPath} />
        </div>

        {/* Scramble Strips */}
        <div className={styles.stripsContainer}>{strips}</div>

        {/* Full Finish Layer */}
        {transition.blend >= 0.98 && (
          <div className={styles.screenLayer}>
            <MediaRenderer src={toPath} />
          </div>
        )}

        {/* Simplified Noise Overlay */}
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              key="noise"
              className={styles.screenNoise}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.05 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  },
);

LaptopScreen.displayName = 'LaptopScreen';
