'use client';

import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import styles from './text-reveal.module.css';

interface TextRevealProps {
  readonly children: React.ReactNode;
  readonly as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  readonly delay?: number;
  readonly duration?: number;
  readonly className?: string;
}

const EASING = [0.25, 0.1, 0.25, 1] as const;

export function TextReveal({
  children,
  as: Tag = 'span',
  delay = 0,
  duration = 0.8,
  className = '',
}: TextRevealProps) {
  const { ref, isInView, shouldReduceMotion } = useScrollReveal();

  const textAnimate =
    shouldReduceMotion || isInView
      ? { clipPath: 'inset(0 0% 0 0)' }
      : { clipPath: 'inset(0 100% 0 0)' };

  const textTransition = {
    duration: shouldReduceMotion ? 0 : duration,
    ease: EASING,
    delay: shouldReduceMotion ? 0 : delay,
  };

  const scanlineAnimate =
    !shouldReduceMotion && isInView
      ? { left: '100%', opacity: 0 }
      : { left: '-2px', opacity: shouldReduceMotion ? 0 : 1 };

  const scanlineTransition = {
    duration: shouldReduceMotion ? 0 : duration,
    ease: EASING,
    delay: shouldReduceMotion ? 0 : delay,
  };

  const glowAnimate =
    !shouldReduceMotion && isInView
      ? { left: '100%', opacity: 0 }
      : { left: '-80px', opacity: 0 };

  const glowTransition = {
    duration: shouldReduceMotion ? 0 : duration * 1.1,
    ease: EASING,
    delay: shouldReduceMotion ? 0 : delay,
  };

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      className={`${styles.revealWrapper} ${className}`.trim()}
    >
      <motion.span
        className={styles.baseText}
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={textAnimate}
        transition={textTransition}
      >
        {children}
      </motion.span>

      <motion.span
        className={styles.scanline}
        initial={{ left: '-2px', opacity: 1 }}
        animate={scanlineAnimate}
        transition={scanlineTransition}
        aria-hidden="true"
      />

      <motion.span
        className={styles.glow}
        style={{ width: 80 }}
        initial={{ left: '-80px', opacity: 0 }}
        animate={glowAnimate}
        transition={glowTransition}
        aria-hidden="true"
      />
    </Tag>
  );
}
