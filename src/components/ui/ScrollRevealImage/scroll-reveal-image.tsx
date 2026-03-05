'use client';

import { motion } from 'framer-motion';
import Image, { type ImageProps } from 'next/image';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import styles from './scroll-reveal-image.module.css';

interface ScrollRevealImageProps extends Omit<ImageProps, 'onLoad'> {
  alt: string;
  delay?: number;
  duration?: number;
  blurAmount?: number;
  className?: string;
}

export function ScrollRevealImage({
  delay = 0,
  duration = 0.8,
  blurAmount = 10,
  className,
  alt,
  ...imageProps
}: Readonly<ScrollRevealImageProps>) {
  const { ref, isInView, shouldReduceMotion } = useScrollReveal();

  return (
    <motion.div
      ref={ref}
      className={`${styles.wrapper} ${className ?? ''}`}
      initial={{ opacity: 0, filter: `blur(${blurAmount}px)` }}
      animate={
        isInView
          ? { opacity: 1, filter: 'blur(0px)' }
          : { opacity: 0, filter: `blur(${blurAmount}px)` }
      }
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Image alt={alt} {...imageProps} />
    </motion.div>
  );
}
