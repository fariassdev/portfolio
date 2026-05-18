'use client';

import { motion, type MotionValue } from 'framer-motion';
import Image from 'next/image';
import { forwardRef, memo, useImperativeHandle, useRef, useState } from 'react';
import styles from './Laptop.module.css';
import type { LaptopScreenHandle } from './Laptop.types';

interface LaptopScreenProps {
  mediaPaths: readonly string[];
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
 * Uses an imperative handle to bypass React's main render cycle for state changes
 * and CSS animations for high-performance transitions.
 */
export const LaptopScreen = memo(
  forwardRef<LaptopScreenHandle, LaptopScreenProps>(
    ({ mediaPaths, opacityMotion }, ref) => {
      const [displayIndex, setDisplayIndex] = useState(0);
      const [prevIndex, setPrevIndex] = useState(0);
      const [transitionStep, setTransitionStep] = useState<'off' | 'on' | null>(
        null,
      );

      const timeoutRef = useRef<NodeJS.Timeout | null>(null);

      useImperativeHandle(ref, () => ({
        transitionTo(from, to) {
          // Clear any pending transition timeouts
          if (timeoutRef.current) clearTimeout(timeoutRef.current);

          setPrevIndex(from);
          setTransitionStep('off');

          // After 'off' animation finishes (0.35s), switch to 'on'
          timeoutRef.current = setTimeout(() => {
            setDisplayIndex(to);
            setTransitionStep('on');

            // After 'on' animation finishes, reset state
            timeoutRef.current = setTimeout(() => {
              setTransitionStep(null);
            }, 350);
          }, 350);
        },
      }));

      const activeIndex = transitionStep === 'off' ? prevIndex : displayIndex;
      const currentPath = mediaPaths[activeIndex];

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

          {/* Main Media Layer with CRT scale/animations */}
          <div
            className={`${styles.screenLayer} ${
              transitionStep === 'off'
                ? styles.screenLayerCRTOff
                : transitionStep === 'on'
                  ? styles.screenLayerCRTOn
                  : ''
            }`}
            style={{ zIndex: 1 }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                background: '#000',
              }}
            >
              <MediaRenderer src={currentPath} />
            </div>

            {/* White Glow Line during transition */}
            {(transitionStep === 'off' || transitionStep === 'on') && (
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
          {transitionStep === 'off' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.35, times: [0, 0.8, 1] }}
              style={{
                position: 'absolute',
                inset: 0,
                background: '#fff',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
          )}

          {/* Simplified Noise Overlay */}
          <div
            className={styles.screenNoise}
            style={{
              opacity: transitionStep ? 0.1 : 0.03,
            }}
          />
        </motion.div>
      );
    },
  ),
);

LaptopScreen.displayName = 'LaptopScreen';
