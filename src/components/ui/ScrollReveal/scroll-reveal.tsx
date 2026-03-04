'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

import { useScrollReveal } from '@/hooks/use-scroll-reveal';

interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  readonly delay?: number;
  readonly duration?: number;
  readonly offsetY?: number;
}

export function ScrollReveal({
  delay = 0,
  duration = 0.6,
  offsetY = 24,
  children,
  ...rest
}: ScrollRevealProps) {
  const { ref, isInView, shouldReduceMotion } = useScrollReveal();

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? false : { opacity: 0, y: offsetY }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: offsetY }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration, delay, ease: [0.25, 0.1, 0.25, 1] }
      }
      {...rest}
    >
      {children}
    </motion.div>
  );
}
