'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { memo } from 'react';
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
 * Implements a vintage TV (CRT) turn-off/on transition effect.
 * Collapses the screen vertically then horizontally to a dot,
 * with scanlines, vignette, and brightness flash.
 */
export const LaptopScreen = memo(
  ({ mediaPaths, transition }: LaptopScreenProps) => {
    const fromPath = mediaPaths[transition.fromIndex];
    const toPath = mediaPaths[transition.toIndex];
    const isTransitioning = transition.blend > 0 && transition.blend < 1;
    const blend = transition.blend;

    // TV Animation Stages:
    // 1. Vertical collapse (0.0 -> 0.3)
    // 2. Horizontal collapse (0.3 -> 0.5)
    // 3. Horizontal expand (0.5 -> 0.7)
    // 4. Vertical expand (0.7 -> 1.0)

    const vCollapse = Math.max(0, Math.min(1, blend / 0.3));
    const hCollapse = Math.max(0, Math.min(1, (blend - 0.3) / 0.2));
    const hExpand = Math.max(0, Math.min(1, (blend - 0.5) / 0.2));
    const vExpand = Math.max(0, Math.min(1, (blend - 0.7) / 0.3));

    const isTurningOff = blend < 0.5;

    let scaleX = 1;
    let scaleY = 1;
    let brightness = 1;
    let flashOpacity = 0;

    if (isTurningOff) {
      scaleY = 1 - vCollapse * 0.998;
      if (blend > 0.3) {
        scaleX = 1 - hCollapse;
      }
      brightness = 1 + vCollapse * 1.5;
    } else {
      scaleX = hExpand;
      scaleY = blend > 0.7 ? 0.002 + vExpand * 0.998 : 0.002;
      brightness = 1 + (1 - vExpand) * 1.5;
    }

    // Flash at the midpoint
    flashOpacity = Math.max(0, 1 - Math.abs(blend - 0.5) * 10);

    // Glowing line intensity
    const lineIntensity = isTurningOff
      ? Math.max(0, (blend - 0.2) / 0.3)
      : Math.max(0, 1 - (blend - 0.5) / 0.3);

    return (
      <div
        className={styles.screenContent}
        style={{ opacity: transition.opacity }}
      >
        {/* CRT Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#050505',
            zIndex: 0,
          }}
        />

        {/* Main Media Layer with CRT scale */}
        <div
          className={styles.screenLayer}
          style={{
            transform: `scale(${scaleX}, ${scaleY})`,
            filter: `brightness(${brightness}) contrast(1.1)`,
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              opacity: isTurningOff ? 1 : 0,
              position: 'absolute',
              background: '#000',
            }}
          >
            <MediaRenderer src={fromPath} />
          </div>
          <div
            style={{
              width: '100%',
              height: '100%',
              opacity: isTurningOff ? 0 : 1,
              position: 'absolute',
              background: '#000',
            }}
          >
            <MediaRenderer src={toPath} />
          </div>

          {/* White Glow Line (Inner) */}
          {isTransitioning && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                height: '2px',
                transform: 'translateY(-50%)',
                background: '#fff',
                boxShadow: '0 0 20px #fff, 0 0 40px #fff',
                opacity: lineIntensity,
                zIndex: 5,
              }}
            />
          )}
        </div>

        {/* CRT Overlays */}
        <div className={styles.crtOverlay}>
          <div className={styles.scanlines} />
          <div className={styles.vignette} />
        </div>

        {/* Mid-transition Flash */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#fff',
            opacity: flashOpacity,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />

        {/* Simplified Noise Overlay */}
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              key="noise"
              className={styles.screenNoise}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  },
);

LaptopScreen.displayName = 'LaptopScreen';
