'use client';

import { motion } from 'framer-motion';
import Image, { type ImageProps } from 'next/image';

import { useScrollReveal } from '@/hooks/use-scroll-reveal';

import styles from './scroll-reveal-image.module.css';

interface ScrollRevealImageProps extends Omit<ImageProps, 'onLoad'> {
  readonly alt: string;
  readonly delay?: number;
  readonly duration?: number;
  readonly blurAmount?: number;
  readonly className?: string;
}

export function ScrollRevealImage({
  delay = 0,
  duration = 0.8,
  blurAmount = 10,
  className,
  alt,
  ...imageProps
}: ScrollRevealImageProps) {
  const { ref, isInView, shouldReduceMotion } = useScrollReveal();

  return (
    <motion.div
      ref={ref}
      className={`${styles.wrapper} ${className ?? ''}`}
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, filter: `blur(${blurAmount}px)` }
      }
      animate={
        isInView
          ? { opacity: 1, filter: 'blur(0px)' }
          : { opacity: 0, filter: `blur(${blurAmount}px)` }
      }
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration, delay, ease: [0.25, 0.1, 0.25, 1] }
      }
    >
      <Image alt={alt} {...imageProps} />
    </motion.div>
  );
}
