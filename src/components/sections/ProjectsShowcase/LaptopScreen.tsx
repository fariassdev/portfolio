'use client';

import { motion, type MotionValue } from 'framer-motion';
import Image from 'next/image';
import { forwardRef, memo, useImperativeHandle, useRef, useState } from 'react';
import styles from './ProjectsShowcase.module.css';

export interface LaptopScreenHandle {
  transitionTo: (fromIndex: number, toIndex: number) => void;
}

interface LaptopScreenProps {
  mediaPaths: readonly string[];
  opacityMotion: MotionValue<number>;
}

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

export const LaptopScreen = memo(
  forwardRef<LaptopScreenHandle, LaptopScreenProps>(
    ({ mediaPaths, opacityMotion }, ref) => {
      const [indices, setIndices] = useState({ from: 0, to: 0 });
      const [isTransitioning, setIsTransitioning] = useState(false);
      const [transitionStep, setTransitionStep] = useState<'off' | 'on' | null>(
        null,
      );

      const timeoutRef = useRef<NodeJS.Timeout | null>(null);

      useImperativeHandle(ref, () => ({
        transitionTo(from, to) {
          if (from === to) return;

          if (timeoutRef.current) clearTimeout(timeoutRef.current);

          setIndices({ from, to });
          setIsTransitioning(true);
          setTransitionStep('off');

          timeoutRef.current = setTimeout(() => {
            setTransitionStep('on');
            timeoutRef.current = setTimeout(() => {
              setIsTransitioning(false);
              setTransitionStep(null);
            }, 350);
          }, 350);
        },
      }));

      const fromPath = mediaPaths[indices.from];
      const toPath = mediaPaths[indices.to];

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
                opacity: transitionStep === 'on' ? 0 : 1,
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
                opacity: transitionStep === 'on' ? 1 : 0,
                position: 'absolute',
                background: '#000',
              }}
            >
              <MediaRenderer src={toPath} />
            </div>

            {/* White Glow Line during transition */}
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

          {/* Mid-transition Flash (CSS handles the main brightness now, but we can keep a subtle flash if desired) */}
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
            style={{ opacity: isTransitioning ? 0.1 : 0.03 }}
          />
        </motion.div>
      );
    },
  ),
);

LaptopScreen.displayName = 'LaptopScreen';
