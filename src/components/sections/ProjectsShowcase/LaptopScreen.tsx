'use client';

import {
  motion,
  useTransform,
  useMotionTemplate,
  type MotionValue,
} from 'framer-motion';
import Image from 'next/image';
import { memo } from 'react';
import styles from './ProjectsShowcase.module.css';

interface LaptopScreenProps {
  mediaPaths: readonly string[];
  fromIndex: number;
  toIndex: number;
  blendMotion: MotionValue<number>;
  opacityMotion: MotionValue<number>;
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
 * Uses framer-motion's MotionValues to bypass React render cycle for smooth 60fps animations.
 */
export const LaptopScreen = memo(
  ({
    mediaPaths,
    fromIndex,
    toIndex,
    blendMotion,
    opacityMotion,
  }: LaptopScreenProps) => {
    const fromPath = mediaPaths[fromIndex];
    const toPath = mediaPaths[toIndex];

    const scaleX = useTransform(blendMotion, (blend) => {
      if (blend < 0.5) {
        return blend > 0.3
          ? 1 - Math.max(0, Math.min(1, (blend - 0.3) / 0.2))
          : 1;
      } else {
        return Math.max(0, Math.min(1, (blend - 0.5) / 0.2));
      }
    });

    const scaleY = useTransform(blendMotion, (blend) => {
      if (blend < 0.5) {
        const vC = Math.max(0, Math.min(1, blend / 0.3));
        return 1 - vC * 0.998;
      } else {
        const vE = Math.max(0, Math.min(1, (blend - 0.7) / 0.3));
        return blend > 0.7 ? 0.002 + vE * 0.998 : 0.002;
      }
    });

    const brightness = useTransform(blendMotion, (blend) => {
      if (blend < 0.5) {
        const vC = Math.max(0, Math.min(1, blend / 0.3));
        return 1 + vC * 1.5;
      } else {
        const vE = Math.max(0, Math.min(1, (blend - 0.7) / 0.3));
        return 1 + (1 - vE) * 1.5;
      }
    });

    const flashOpacity = useTransform(blendMotion, (blend) =>
      Math.max(0, 1 - Math.abs(blend - 0.5) * 10),
    );

    const lineIntensity = useTransform(blendMotion, (blend) => {
      const isOff = blend < 0.5;
      return isOff
        ? Math.max(0, (blend - 0.2) / 0.3)
        : Math.max(0, 1 - (blend - 0.5) / 0.3);
    });

    const noiseOpacity = useTransform(blendMotion, (blend) => {
      return blend > 0 && blend < 1 ? 0.1 : 0;
    });

    const fromOpacity = useTransform(blendMotion, (blend) =>
      blend < 0.5 ? 1 : 0,
    );
    const toOpacity = useTransform(blendMotion, (blend) =>
      blend < 0.5 ? 0 : 1,
    );
    const lineDisplay = useTransform(blendMotion, (blend) =>
      blend > 0 && blend < 1 ? 'block' : 'none',
    );

    const layerTransform = useMotionTemplate`scale(${scaleX}, ${scaleY})`;
    const layerFilter = useMotionTemplate`brightness(${brightness}) contrast(1.1)`;

    return (
      <motion.div
        className={styles.screenContent}
        style={{ opacity: opacityMotion }}
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
        <motion.div
          className={styles.screenLayer}
          style={{
            transform: layerTransform,
            filter: layerFilter,
            zIndex: 1,
          }}
        >
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              opacity: fromOpacity,
              position: 'absolute',
              background: '#000',
            }}
          >
            <MediaRenderer src={fromPath} />
          </motion.div>
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              opacity: toOpacity,
              position: 'absolute',
              background: '#000',
            }}
          >
            <MediaRenderer src={toPath} />
          </motion.div>

          {/* White Glow Line (Inner) */}
          <motion.div
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
              display: lineDisplay,
              zIndex: 5,
            }}
          />
        </motion.div>

        {/* CRT Overlays */}
        <div className={styles.crtOverlay}>
          <div className={styles.scanlines} />
          <div className={styles.vignette} />
        </div>

        {/* Mid-transition Flash */}
        <motion.div
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
        <motion.div
          className={styles.screenNoise}
          style={{ opacity: noiseOpacity }}
        />
      </motion.div>
    );
  },
);

LaptopScreen.displayName = 'LaptopScreen';
